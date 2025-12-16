import { Server as SocketIOServer, Socket } from 'socket.io';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc } from 'drizzle-orm';
import { files, fileVersions } from '../../src/db/schema';
import {
    uploadFile,
    getFile,
    deleteFile as deleteMinioFile,
    generateMinioPath,
    BUCKETS,
    fileExists,
} from '../../src/lib/minio';
import { cacheGet, cacheSet, cacheDel } from '../../src/lib/redis';
import { logger } from '../utils/logger';
import { checkRateLimit } from '../middleware/rate-limit';

// Initialize database connection
const connectionString = process.env.DATABASE_URL || '';
const sql = postgres(connectionString);
const db = drizzle(sql);

// Types
interface FileUpdatePayload {
    fileId: string;
    content: string;
    projectId: string;
    createVersion?: boolean;
}

interface FileLoadPayload {
    fileId: string;
}

interface FileVersionsPayload {
    fileId: string;
}

interface FileRestorePayload {
    fileId: string;
    versionId: string;
}

interface CallbackResponse {
    success?: boolean;
    error?: string;
    [key: string]: unknown;
}

type Callback = (response: CallbackResponse) => void;

export function fileHandler(io: SocketIOServer, socket: Socket): void {
    const userId = socket.data.userId;
    const socketLogger = logger.child({ userId, socketId: socket.id });

    // ==========================================
    // EVENT: file:update - Save file to MinIO
    // ==========================================
    socket.on('file:update', async (payload: FileUpdatePayload, callback: Callback) => {
        const startTime = Date.now();

        try {
            // Rate limit check
            const { allowed, retryAfter } = await checkRateLimit(userId);
            if (!allowed) {
                return callback({
                    error: `Rate limit exceeded. Retry after ${retryAfter} seconds`,
                });
            }

            const { fileId, content, projectId, createVersion } = payload;

            // Validate payload
            if (!fileId || content === undefined || !projectId) {
                return callback({ error: 'Missing required fields' });
            }

            // Get file metadata
            const [file] = await db
                .select()
                .from(files)
                .where(eq(files.id, fileId));

            if (!file) {
                return callback({ error: 'File not found' });
            }

            if (file.type !== 'file') {
                return callback({ error: 'Cannot update folder content' });
            }

            // Generate MinIO path
            const minioPath = file.minioPath || generateMinioPath(projectId, fileId);

            // Create version snapshot before update if requested
            if (createVersion && file.minioPath) {
                const existingContent = await getFile(BUCKETS.FILES, file.minioPath);
                const versionPath = `versions/${fileId}/${Date.now()}.mmd`;

                await uploadFile(BUCKETS.FILES, versionPath, existingContent);

                await db.insert(fileVersions).values({
                    fileId,
                    minioPath: versionPath,
                    size: Buffer.byteLength(existingContent, 'utf-8'),
                    createdBy: userId,
                });
            }

            // Upload to MinIO
            const { etag } = await uploadFile(
                BUCKETS.FILES,
                minioPath,
                content,
                {
                    'x-amz-meta-user-id': userId,
                    'x-amz-meta-file-name': file.name,
                    'x-amz-meta-project-id': projectId,
                }
            );

            const contentSize = Buffer.byteLength(content, 'utf-8');

            // Update metadata in PostgreSQL
            await db
                .update(files)
                .set({
                    minioPath,
                    minioEtag: etag,
                    size: contentSize,
                    isMigrated: true,
                    content: null, // Clear legacy content
                    updatedAt: new Date(),
                })
                .where(eq(files.id, fileId));

            // Invalidate cache
            await cacheDel(`file:${fileId}`);

            const duration = Date.now() - startTime;

            socketLogger.info(
                { fileId, size: contentSize, duration },
                'File saved to MinIO'
            );

            // Send acknowledgment
            callback({
                success: true,
                fileId,
                size: contentSize,
                etag,
                timestamp: Date.now(),
                duration,
            });

            // Broadcast to other clients in project room
            socket.to(`project:${projectId}`).emit('file:updated', {
                fileId,
                userId,
                size: contentSize,
                timestamp: Date.now(),
            });
        } catch (error) {
            socketLogger.error({ error }, 'File update error');
            callback({
                error: 'Failed to save file',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // ==========================================
    // EVENT: file:load - Load file from MinIO
    // ==========================================
    socket.on('file:load', async (payload: FileLoadPayload, callback: Callback) => {
        try {
            const { fileId } = payload;

            if (!fileId) {
                return callback({ error: 'File ID required' });
            }

            // Check cache first
            const cached = await cacheGet<{ content: string; size: number }>(`file:${fileId}`);
            if (cached) {
                socketLogger.debug({ fileId }, 'File loaded from cache');
                return callback({
                    success: true,
                    content: cached.content,
                    size: cached.size,
                    cached: true,
                });
            }

            // Get file metadata
            const [file] = await db
                .select()
                .from(files)
                .where(eq(files.id, fileId));

            if (!file) {
                return callback({ error: 'File not found' });
            }

            if (file.type !== 'file') {
                return callback({ error: 'Cannot load folder content' });
            }

            let content: string;

            // Check if migrated to MinIO
            if (file.isMigrated && file.minioPath) {
                // Load from MinIO
                content = await getFile(BUCKETS.FILES, file.minioPath);
            } else if (file.content !== null) {
                // Legacy: Load from database
                content = file.content;
            } else {
                content = '';
            }

            const size = Buffer.byteLength(content, 'utf-8');

            // Cache the content (5 minutes TTL)
            await cacheSet(`file:${fileId}`, { content, size }, 300);

            socketLogger.debug({ fileId, size }, 'File loaded from MinIO');

            callback({
                success: true,
                content,
                size,
                cached: false,
            });
        } catch (error) {
            socketLogger.error({ error }, 'File load error');
            callback({
                error: 'Failed to load file',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // ==========================================
    // EVENT: file:versions - List file versions
    // ==========================================
    socket.on('file:versions', async (payload: FileVersionsPayload, callback: Callback) => {
        try {
            const { fileId } = payload;

            if (!fileId) {
                return callback({ error: 'File ID required' });
            }

            const versions = await db
                .select()
                .from(fileVersions)
                .where(eq(fileVersions.fileId, fileId))
                .orderBy(desc(fileVersions.createdAt));

            callback({
                success: true,
                versions: versions.map((v) => ({
                    id: v.id,
                    minioPath: v.minioPath,
                    size: v.size,
                    createdAt: v.createdAt,
                    comment: v.comment,
                })),
            });
        } catch (error) {
            socketLogger.error({ error }, 'Failed to load versions');
            callback({ error: 'Failed to load versions' });
        }
    });

    // ==========================================
    // EVENT: file:restore - Restore old version
    // ==========================================
    socket.on('file:restore', async (payload: FileRestorePayload, callback: Callback) => {
        try {
            const { fileId, versionId } = payload;

            if (!fileId || !versionId) {
                return callback({ error: 'File ID and Version ID required' });
            }

            // Get version info
            const [version] = await db
                .select()
                .from(fileVersions)
                .where(eq(fileVersions.id, versionId));

            if (!version) {
                return callback({ error: 'Version not found' });
            }

            // Get file metadata
            const [file] = await db
                .select()
                .from(files)
                .where(eq(files.id, fileId));

            if (!file) {
                return callback({ error: 'File not found' });
            }

            // Load old version content from MinIO
            const content = await getFile(BUCKETS.FILES, version.minioPath);
            const minioPath = file.minioPath || generateMinioPath(file.projectId, fileId);

            // Save current version before restoring
            if (file.minioPath && (await fileExists(BUCKETS.FILES, file.minioPath))) {
                const currentContent = await getFile(BUCKETS.FILES, file.minioPath);
                const backupPath = `versions/${fileId}/${Date.now()}_before_restore.mmd`;

                await uploadFile(BUCKETS.FILES, backupPath, currentContent);

                await db.insert(fileVersions).values({
                    fileId,
                    minioPath: backupPath,
                    size: Buffer.byteLength(currentContent, 'utf-8'),
                    createdBy: userId,
                    comment: 'Auto-backup before restore',
                });
            }

            // Upload restored content as new current version
            const { etag } = await uploadFile(BUCKETS.FILES, minioPath, content, {
                'x-amz-meta-restored-from': versionId,
            });

            const size = Buffer.byteLength(content, 'utf-8');

            // Update file metadata
            await db
                .update(files)
                .set({
                    minioPath,
                    minioEtag: etag,
                    size,
                    updatedAt: new Date(),
                })
                .where(eq(files.id, fileId));

            // Invalidate cache
            await cacheDel(`file:${fileId}`);

            socketLogger.info({ fileId, versionId }, 'File version restored');

            callback({
                success: true,
                content,
                size,
                etag,
            });
        } catch (error) {
            socketLogger.error({ error }, 'Failed to restore version');
            callback({ error: 'Failed to restore version' });
        }
    });

    // ==========================================
    // EVENT: file:delete - Delete file from MinIO
    // ==========================================
    socket.on('file:delete', async (payload: { fileId: string }, callback: Callback) => {
        try {
            const { fileId } = payload;

            if (!fileId) {
                return callback({ error: 'File ID required' });
            }

            // Get file metadata
            const [file] = await db
                .select()
                .from(files)
                .where(eq(files.id, fileId));

            if (!file) {
                return callback({ error: 'File not found' });
            }

            // Delete from MinIO if exists
            if (file.minioPath) {
                try {
                    await deleteMinioFile(BUCKETS.FILES, file.minioPath);
                } catch {
                    // Ignore if file doesn't exist in MinIO
                }
            }

            // Delete versions from MinIO
            const versions = await db
                .select()
                .from(fileVersions)
                .where(eq(fileVersions.fileId, fileId));

            for (const version of versions) {
                try {
                    await deleteMinioFile(BUCKETS.FILES, version.minioPath);
                } catch {
                    // Ignore errors
                }
            }

            // Delete from database (cascade will delete versions)
            await db.delete(files).where(eq(files.id, fileId));

            // Invalidate cache
            await cacheDel(`file:${fileId}`);

            socketLogger.info({ fileId }, 'File deleted');

            callback({ success: true });
        } catch (error) {
            socketLogger.error({ error }, 'Failed to delete file');
            callback({ error: 'Failed to delete file' });
        }
    });

    // ==========================================
    // EVENT: project:subscribe - Join project room
    // ==========================================
    socket.on('project:subscribe', async (projectId: string) => {
        socket.join(`project:${projectId}`);
        socketLogger.info({ projectId }, 'Subscribed to project');

        // Notify others in project
        socket.to(`project:${projectId}`).emit('user:joined', {
            userId,
            username: socket.data.username,
            timestamp: Date.now(),
        });
    });

    // ==========================================
    // EVENT: project:unsubscribe - Leave project room
    // ==========================================
    socket.on('project:unsubscribe', (projectId: string) => {
        socket.leave(`project:${projectId}`);
        socketLogger.info({ projectId }, 'Unsubscribed from project');

        // Notify others in project
        socket.to(`project:${projectId}`).emit('user:left', {
            userId,
            username: socket.data.username,
            timestamp: Date.now(),
        });
    });
}
