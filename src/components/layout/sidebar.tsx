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

export function Sidebar() {
    const { files, activeFileId, setActiveFile, toggleFolder, addFile, deleteFile } = useFileSystemStore();
    const { setCode } = useEditorStore();

    const handleFileClick = (file: FileNode) => {
        if (file.type === "folder") {
            toggleFolder(file.id);
        } else {
            setActiveFile(file.id);
            setCode(file.content || "");
        }
    };

    // Build tree structure for rendering
    const buildTree = (parentId: string | null = null, depth = 0): React.ReactNode[] => {
        return files
            .filter((f) => f.parentId === parentId)
            .map((file) => (
                <div key={file.id}>
                    <div
                        className={cn(
                            "flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-white/5 text-sm select-none",
                            activeFileId === file.id && "bg-white/10 text-accent border-l-2 border-accent"
                        )}
                        style={{ paddingLeft: `${depth * 12 + 8}px` }}
                        onClick={() => handleFileClick(file)}
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

                        <span className="truncate">{file.name}</span>
                    </div>

                    {file.type === "folder" && file.isOpen && buildTree(file.id, depth + 1)}
                </div>
            ));
    };

    return (
        <div className="h-full flex flex-col bg-secondary text-secondary-foreground border-r border-border font-sans">
            <div className="p-3 border-b border-border flex items-center justify-between bg-[#112240]">
                <span className="font-bold text-xs tracking-widest text-muted-foreground">EXPLORER</span>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-white/10 rounded" title="New File" onClick={() => addFile("New File.mmd", "file", "1")}>
                        <FilePlus size={14} />
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded" title="New Folder" onClick={() => addFile("New Folder", "folder", "1")}>
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
