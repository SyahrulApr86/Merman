import React from "react";
import {
    File,
    Folder,
    FolderOpen,
    ChevronRight,
    ChevronDown,
    Plus,
    Trash2,
    FilePlus,
    FolderPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileSystemStore, FileNode } from "@/store/use-file-system-store";
import { useEditorStore } from "@/store/use-editor-store";

export function Sidebar({ projectId }: { projectId: string }) {
    const { files, activeFileId, setActiveFile, toggleFolder, addFile, deleteFile, renameFile, moveFile } = useFileSystemStore();
    const { setCode } = useEditorStore();
    const [renamingId, setRenamingId] = React.useState<string | null>(null);
    const [renameValue, setRenameValue] = React.useState("");
    const [dragOverId, setDragOverId] = React.useState<string | null>(null);

    const handleFileClick = (file: FileNode) => {
        if (renamingId === file.id) return; // Don't toggle if renaming

        if (file.type === "folder") {
            toggleFolder(file.id);
        } else {
            setActiveFile(file.id);
            setCode(file.content || "");
        }
    };

    const handleAddFile = async (type: "file" | "folder") => {
        const id = crypto.randomUUID();

        let parentId: string | null = null;
        if (activeFileId) {
            const active = files.find(f => f.id === activeFileId);
            if (active) {
                if (active.type === "folder") {
                    parentId = active.id;
                } else {
                    parentId = active.parentId;
                }
            }
        }

        const name = type === "file" ? "New File.mmd" : "New Folder";

        // Optimistic
        addFile(name, type, parentId, id);

        // Server
        const { createFile } = await import("@/app/actions");
        await createFile(projectId, parentId, name, type, id);

        // Auto start renaming
        setRenamingId(id);
        setRenameValue(name);
    };

    const handleDoubleClick = (e: React.MouseEvent, file: FileNode) => {
        e.stopPropagation();
        setRenamingId(file.id);
        setRenameValue(file.name);
    };

    const handleRenameSubmit = async () => {
        if (!renamingId || !renameValue.trim()) {
            setRenamingId(null);
            return;
        }

        // Optimistic update
        renameFile(renamingId, renameValue);

        // Server update
        const { renameFile: renameFileAction } = await import("@/app/actions");
        await renameFileAction(renamingId, renameValue);

        setRenamingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleRenameSubmit();
        } else if (e.key === "Escape") {
            setRenamingId(null);
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, file: FileNode) => {
        e.dataTransfer.setData("fileId", file.id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, file: FileNode) => {
        e.preventDefault();
        e.stopPropagation();
        if (file.type === "folder") {
            setDragOverId(file.id);
            e.dataTransfer.dropEffect = "move";
        } else {
            setDragOverId(null);
            e.dataTransfer.dropEffect = "none";
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverId(null);
    };

    const handleDrop = async (e: React.DragEvent, targetFolder: FileNode | null) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverId(null);

        const fileId = e.dataTransfer.getData("fileId");
        if (!fileId) return;

        // Prevent dropping onto itself or immediate parent (optimization)
        const file = files.find(f => f.id === fileId);
        const targetId = targetFolder ? targetFolder.id : null;

        if (!file || file.parentId === targetId || file.id === targetId) return;

        // Optimistic update
        moveFile(fileId, targetId);

        // Server update
        const { moveFile: moveFileAction } = await import("@/app/actions");
        await moveFileAction(fileId, targetId);
    };

    // Handle drop on empty area (root)
    const handleRootDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        // Only handle if not dropped on a child
        if (e.target !== e.currentTarget) return;

        const fileId = e.dataTransfer.getData("fileId");
        if (!fileId) return;

        const file = files.find(f => f.id === fileId);
        if (!file || file.parentId === null) return;

        moveFile(fileId, null);
        const { moveFile: moveFileAction } = await import("@/app/actions");
        await moveFileAction(fileId, null);
    };

    // Build tree structure for rendering
    const buildTree = (parentId: string | null = null, depth = 0): React.ReactNode[] => {
        return files
            .filter((f) => f.parentId === parentId)
            .map((file) => (
                <div key={file.id}>
                    <div
                        draggable={renamingId !== file.id}
                        onDragStart={(e) => handleDragStart(e, file)}
                        onDragOver={(e) => handleDragOver(e, file)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, file)}
                        className={cn(
                            "flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-white/5 text-sm select-none group border-2 border-transparent",
                            activeFileId === file.id && "bg-white/10 text-accent border-l-accent",
                            dragOverId === file.id && "border-primary bg-primary/10"
                        )}
                        style={{ paddingLeft: `${depth * 12 + 8}px` }}
                        onClick={() => handleFileClick(file)}
                        onDoubleClick={(e) => handleDoubleClick(e, file)}
                    >
                        <span className="opacity-70">
                            {file.type === "folder" ? (
                                file.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                            ) : (
                                <span className="w-[14px]" />
                            )}
                        </span>

                        <span className="text-accent/80">
                            {file.type === "folder" ? (
                                file.isOpen ? <FolderOpen size={14} /> : <Folder size={14} />
                            ) : (
                                <File size={14} />
                            )}
                        </span>

                        {renamingId === file.id ? (
                            <input
                                autoFocus
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={handleRenameSubmit}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-background border border-primary text-foreground px-1 py-0.5 text-xs w-full outline-none rounded-sm"
                            />
                        ) : (
                            <span className="truncate">{file.name}</span>
                        )}
                    </div>

                    {file.type === "folder" && file.isOpen && buildTree(file.id, depth + 1)}
                </div>
            ));
    };

    return (
        <div
            className="h-full flex flex-col bg-secondary text-secondary-foreground border-r border-border font-sans"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleRootDrop}
        >
            <div className="p-3 border-b border-border flex items-center justify-between bg-[#112240]">
                <span className="font-bold text-xs tracking-widest text-muted-foreground">EXPLORER</span>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-white/10 rounded" title="New File" onClick={() => handleAddFile("file")}>
                        <FilePlus size={14} />
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded" title="New Folder" onClick={() => handleAddFile("folder")}>
                        <FolderPlus size={14} />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
                {buildTree(null)}
            </div>
        </div>
    );
}
