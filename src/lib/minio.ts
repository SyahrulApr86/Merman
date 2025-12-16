import { Client } from 'minio';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000');
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'merman';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'merman_minio_password';
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';

export const minioClient = new Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
});

// Bucket names
export const BUCKETS = {
    FILES: 'merman-files',
    EXPORTS: 'merman-exports',
} as const;

// Initialize buckets
export async function initializeMinIO(): Promise<void> {
    try {
        for (const bucket of Object.values(BUCKETS)) {
            const exists = await minioClient.bucketExists(bucket);

            if (!exists) {
                await minioClient.makeBucket(bucket, 'us-east-1');
                console.log(`✅ Created MinIO bucket: ${bucket}`);
            }
        }

        console.log('✅ MinIO initialized successfully');
    } catch (error) {
        console.error('❌ MinIO initialization error:', error);
        throw error;
    }
}

// Upload file to MinIO
export async function uploadFile(
    bucket: string,
    objectName: string,
    content: string | Buffer,
    metadata?: Record<string, string>
): Promise<{ etag: string; versionId?: string }> {
    const buffer = typeof content === 'string'
        ? Buffer.from(content, 'utf-8')
        : content;

    const result = await minioClient.putObject(
        bucket,
        objectName,
        buffer,
        buffer.length,
        {
            'Content-Type': 'text/plain; charset=utf-8',
            ...metadata,
        }
    );

    return {
        etag: result.etag,
        versionId: result.versionId || undefined,
    };
}

// Get file from MinIO
export async function getFile(
    bucket: string,
    objectName: string
): Promise<string> {
    const stream = await minioClient.getObject(bucket, objectName);

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        stream.on('error', reject);
    });
}

// Check if file exists
export async function fileExists(
    bucket: string,
    objectName: string
): Promise<boolean> {
    try {
        await minioClient.statObject(bucket, objectName);
        return true;
    } catch {
        return false;
    }
}

// Delete file from MinIO
export async function deleteFile(
    bucket: string,
    objectName: string
): Promise<void> {
    await minioClient.removeObject(bucket, objectName);
}

// Get file stats
export async function getFileStats(
    bucket: string,
    objectName: string
): Promise<{ size: number; lastModified: Date; etag: string } | null> {
    try {
        const stat = await minioClient.statObject(bucket, objectName);
        return {
            size: stat.size,
            lastModified: stat.lastModified,
            etag: stat.etag,
        };
    } catch {
        return null;
    }
}

// List files in bucket with prefix
export async function listFiles(
    bucket: string,
    prefix?: string
): Promise<Array<{ name: string; size: number; lastModified: Date }>> {
    const files: Array<{ name: string; size: number; lastModified: Date }> = [];

    const stream = minioClient.listObjects(bucket, prefix, true);

    return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
            if (obj.name) {
                files.push({
                    name: obj.name,
                    size: obj.size,
                    lastModified: obj.lastModified,
                });
            }
        });
        stream.on('end', () => resolve(files));
        stream.on('error', reject);
    });
}

// Generate presigned URL for download
export async function getPresignedUrl(
    bucket: string,
    objectName: string,
    expiry: number = 3600 // 1 hour
): Promise<string> {
    return await minioClient.presignedGetObject(bucket, objectName, expiry);
}

// Generate presigned URL for upload
export async function getPresignedPutUrl(
    bucket: string,
    objectName: string,
    expiry: number = 3600 // 1 hour
): Promise<string> {
    return await minioClient.presignedPutObject(bucket, objectName, expiry);
}

// Copy file within MinIO
export async function copyFile(
    sourceBucket: string,
    sourceObject: string,
    destBucket: string,
    destObject: string
): Promise<void> {
    const conds = new (await import('minio')).CopyConditions();
    await minioClient.copyObject(
        destBucket,
        destObject,
        `/${sourceBucket}/${sourceObject}`,
        conds
    );
}

// Generate MinIO path for a file
export function generateMinioPath(projectId: string, fileId: string): string {
    return `projects/${projectId}/${fileId}.mmd`;
}
