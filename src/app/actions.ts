"use server";

import { db } from "@/db";
import { projects, files, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, desc, ne, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FileNode } from "@/store/use-file-system-store";

export async function createProject(formData: FormData) {
    const session = await getSession();
    if (!session) redirect("/login");

    const name = formData.get("name") as string;
    if (!name) return;

    const [newProject] = await db.insert(projects).values({
        userId: session.user.id,
        name: name,
    }).returning();

    // Create a default root folder or file if needed
    // For now, let's just create a default "main.mmd"
    await db.insert(files).values({
        projectId: newProject.id,
        name: "main.mmd",
        type: "file",
        content: "graph TD\n  A[Start] --> B[End]",
    });

    revalidatePath("/");
    redirect(`/project/${newProject.id}`);
}

export async function getProjects() {
    const session = await getSession();
    if (!session) return [];

    return await db.select()
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

    return projectFiles.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type as "file" | "folder",
        parentId: f.parentId,
        content: f.content || undefined,
        isOpen: false // Default state
    }));
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
            ne(files.id, fileId) // Exclude self
        )
    });

    if (existing) return { error: "File name already exists" };

    await db.update(files)
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
        )
    });

    if (existing) return { error: "File with same name exists in destination" };

    await db.update(files)
        .set({ parentId: newParentId, updatedAt: new Date() })
        .where(eq(files.id, fileId));

    return { success: true };
}

export async function createFile(projectId: string, parentId: string | null, name: string, type: "file" | "folder", id: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Check for duplicate
    const existing = await db.query.files.findFirst({
        where: and(
            eq(files.projectId, projectId),
            parentId ? eq(files.parentId, parentId) : isNull(files.parentId),
            eq(files.name, name)
        )
    });

    if (existing) return { error: "File name already exists" };

    await db.insert(files).values({
        id: id,
        projectId: projectId,
        parentId: parentId,
        name: name,
        type: type,
        content: type === "file" ? "" : undefined,
    });

    return { success: true };
}

export async function updateFileContent(fileId: string, content: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    await db.update(files)
        .set({ content: content, updatedAt: new Date() })
        .where(eq(files.id, fileId));

    return { success: true };
}
