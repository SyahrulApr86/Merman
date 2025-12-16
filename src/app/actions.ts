"use server";

import { db } from "@/db";
import { projects, files } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, desc, ne, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FileNode } from "@/store/use-file-system-store";

// MinIO imports - lazy loaded to avoid issues in edge runtime
async function getMinioClient() {
    const {
        uploadFile,
        getFile,
        deleteFile: deleteMinioFile,
        generateMinioPath,
        BUCKETS,
        fileExists,
    } = await import("@/lib/minio");
    return { uploadFile, getFile, deleteMinioFile, generateMinioPath, BUCKETS, fileExists };
}

export async function createProject(formData: FormData) {
    const session = await getSession();
    if (!session) redirect("/login");

    const name = formData.get("name") as string;
    if (!name) return;

    const [newProject] = await db
        .insert(projects)
        .values({
            userId: session.user.id,
            name: name,
        })
        .returning();

    // Create a default "main.mmd" file
    const defaultContent = "graph TD\n  A[Start] --> B[End]";
    const fileId = crypto.randomUUID();

    // Try to save to MinIO first
    try {
        const { uploadFile, generateMinioPath, BUCKETS } = await getMinioClient();
        const minioPath = generateMinioPath(newProject.id, fileId);
        const { etag } = await uploadFile(BUCKETS.FILES, minioPath, defaultContent);

        await db.insert(files).values({
            id: fileId,
            projectId: newProject.id,
            name: "main.mmd",
            type: "file",
            minioPath,
            minioEtag: etag,
            size: Buffer.byteLength(defaultContent, "utf-8"),
            isMigrated: true,
            content: null, // Don't store in database
        });
    } catch (error) {
        console.error("Failed to save to MinIO, using database fallback:", error);
        // Fallback: Store in database
        await db.insert(files).values({
            id: fileId,
            projectId: newProject.id,
            name: "main.mmd",
            type: "file",
            content: defaultContent,
            size: Buffer.byteLength(defaultContent, "utf-8"),
            isMigrated: false,
        });
    }

    revalidatePath("/");
    redirect(`/project/${newProject.id}`);
}

export async function getProjects() {
    const session = await getSession();
    if (!session) return [];

    return await db
        .select()
        .from(projects)
        .where(eq(projects.userId, session.user.id))
        .orderBy(desc(projects.createdAt));
}

export async function getProjectFiles(projectId: string): Promise<FileNode[]> {
    const session = await getSession();
    if (!session) return [];

    // Verify ownership
    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, session.user.id)),
    });

    if (!project) return [];

    const projectFiles = await db.select().from(files).where(eq(files.projectId, projectId));

    // Load content from MinIO for migrated files
    const filesWithContent = await Promise.all(
        projectFiles.map(async (f) => {
            let content = f.content || undefined;

            // If file is migrated to MinIO, load content from there
            if (f.isMigrated && f.minioPath && f.type === "file") {
                try {
                    const { getFile, BUCKETS } = await getMinioClient();
                    content = await getFile(BUCKETS.FILES, f.minioPath);
                } catch (error) {
                    console.error(`Failed to load file ${f.id} from MinIO:`, error);
                    // Keep existing content or empty
                }
            }

            return {
                id: f.id,
                name: f.name,
                type: f.type as "file" | "folder",
                parentId: f.parentId,
                content,
                isOpen: false,
            };
        })
    );

    return filesWithContent;
}

export async function signOut() {
    const { logout } = await import("@/lib/auth");
    await logout();
    redirect("/login");
}

export async function getProject(projectId: string) {
    const session = await getSession();
    if (!session) return null;

    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, session.user.id)),
    });

    return project;
}

export async function renameFile(fileId: string, newName: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const [file] = await db.select().from(files).where(eq(files.id, fileId));
    if (!file) return { error: "File not found" };

    // Check for duplicate
    const existing = await db.query.files.findFirst({
        where: and(
            eq(files.projectId, file.projectId),
            file.parentId ? eq(files.parentId, file.parentId) : isNull(files.parentId),
            eq(files.name, newName),
            ne(files.id, fileId)
        ),
    });

    if (existing) return { error: "File name already exists" };

    await db
        .update(files)
        .set({ name: newName, updatedAt: new Date() })
        .where(eq(files.id, fileId));

    revalidatePath("/project/[id]");
    return { success: true };
}

export async function moveFile(fileId: string, newParentId: string | null) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    if (fileId === newParentId) return { error: "Cannot move folder into itself" };

    const [file] = await db.select().from(files).where(eq(files.id, fileId));
    if (!file) return { error: "File not found" };

    // Check for duplicate in destination
    const existing = await db.query.files.findFirst({
        where: and(
            eq(files.projectId, file.projectId),
            newParentId ? eq(files.parentId, newParentId) : isNull(files.parentId),
            eq(files.name, file.name),
            ne(files.id, fileId)
        ),
    });

    if (existing) return { error: "File with same name exists in destination" };

    await db
        .update(files)
        .set({ parentId: newParentId, updatedAt: new Date() })
        .where(eq(files.id, fileId));

    return { success: true };
}

export async function createFile(
    projectId: string,
    parentId: string | null,
    name: string,
    type: "file" | "folder",
    id: string
) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Check for duplicate
    const existing = await db.query.files.findFirst({
        where: and(
            eq(files.projectId, projectId),
            parentId ? eq(files.parentId, parentId) : isNull(files.parentId),
            eq(files.name, name)
        ),
    });

    if (existing) return { error: "File name already exists" };

    if (type === "file") {
        const defaultContent = "";

        // Try to save to MinIO
        try {
            const { uploadFile, generateMinioPath, BUCKETS } = await getMinioClient();
            const minioPath = generateMinioPath(projectId, id);
            const { etag } = await uploadFile(BUCKETS.FILES, minioPath, defaultContent);

            await db.insert(files).values({
                id,
                projectId,
                parentId,
                name,
                type,
                minioPath,
                minioEtag: etag,
                size: 0,
                isMigrated: true,
                content: null,
            });
        } catch (error) {
            console.error("Failed to save to MinIO, using database fallback:", error);
            await db.insert(files).values({
                id,
                projectId,
                parentId,
                name,
                type,
                content: defaultContent,
                isMigrated: false,
            });
        }
    } else {
        // Folders don't need MinIO
        await db.insert(files).values({
            id,
            projectId,
            parentId,
            name,
            type,
        });
    }

    return { success: true };
}

export async function updateFileContent(fileId: string, content: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const [file] = await db.select().from(files).where(eq(files.id, fileId));
    if (!file) return { error: "File not found" };

    const size = Buffer.byteLength(content, "utf-8");

    // Try to save to MinIO first
    try {
        const { uploadFile, generateMinioPath, BUCKETS } = await getMinioClient();
        const minioPath = file.minioPath || generateMinioPath(file.projectId, fileId);
        const { etag } = await uploadFile(BUCKETS.FILES, minioPath, content);

        await db
            .update(files)
            .set({
                minioPath,
                minioEtag: etag,
                size,
                isMigrated: true,
                content: null, // Clear database content
                updatedAt: new Date(),
            })
            .where(eq(files.id, fileId));
    } catch (error) {
        console.error("Failed to save to MinIO, using database fallback:", error);
        // Fallback: Store in database
        await db
            .update(files)
            .set({
                content,
                size,
                isMigrated: false,
                updatedAt: new Date(),
            })
            .where(eq(files.id, fileId));
    }

    return { success: true };
}

export async function deleteFile(fileId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Recursive delete function
    async function deleteRecursive(id: string) {
        // Find children
        const children = await db.select().from(files).where(eq(files.parentId, id));

        for (const child of children) {
            await deleteRecursive(child.id);
        }

        // Get file info before deleting
        const [file] = await db.select().from(files).where(eq(files.id, id));

        // Delete from MinIO if exists
        if (file?.minioPath) {
            try {
                const { deleteMinioFile, BUCKETS } = await getMinioClient();
                await deleteMinioFile(BUCKETS.FILES, file.minioPath);
            } catch (error) {
                console.error(`Failed to delete file ${id} from MinIO:`, error);
                // Continue with database deletion
            }
        }

        // Delete from database
        await db.delete(files).where(eq(files.id, id));
    }

    await deleteRecursive(fileId);

    revalidatePath("/project/[id]");
    return { success: true };
}

// Migration helper: Migrate existing files to MinIO
export async function migrateFileToMinIO(fileId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const [file] = await db.select().from(files).where(eq(files.id, fileId));
    if (!file) return { error: "File not found" };
    if (file.type !== "file") return { error: "Can only migrate files" };
    if (file.isMigrated) return { error: "File already migrated" };

    const content = file.content || "";

    try {
        const { uploadFile, generateMinioPath, BUCKETS } = await getMinioClient();
        const minioPath = generateMinioPath(file.projectId, fileId);
        const { etag } = await uploadFile(BUCKETS.FILES, minioPath, content);

        await db
            .update(files)
            .set({
                minioPath,
                minioEtag: etag,
                size: Buffer.byteLength(content, "utf-8"),
                isMigrated: true,
                content: null,
                updatedAt: new Date(),
            })
            .where(eq(files.id, fileId));

        return { success: true };
    } catch (error) {
        console.error("Migration failed:", error);
        return { error: "Migration failed" };
    }
}
