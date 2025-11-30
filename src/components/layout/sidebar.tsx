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
