import { create } from "zustand";

export type FileType = "file" | "folder";

export interface FileNode {
    id: string;
    name: string;
    type: FileType;
    content?: string; // Only for files
    parentId: string | null;
    children?: FileNode[]; // For folders (computed or stored flat?)
    isOpen?: boolean; // For folders
}

interface FileSystemState {
    files: FileNode[];
    activeFileId: string | null;
    addFile: (name: string, type: FileType, parentId: string | null) => void;
    deleteFile: (id: string) => void;
    renameFile: (id: string, newName: string) => void;
    setActiveFile: (id: string) => void;
    toggleFolder: (id: string) => void;
    updateFileContent: (id: string, content: string) => void;
    setFiles: (files: FileNode[]) => void;
}

const initialFiles: FileNode[] = [
    { id: "1", name: "Project", type: "folder", parentId: null, isOpen: true },
    { id: "2", name: "main.mmd", type: "file", parentId: "1", content: "graph TD\n  A[Start] --> B[End]" },
    { id: "3", name: "docs", type: "folder", parentId: "1", isOpen: false },
    { id: "4", name: "readme.md", type: "file", parentId: "3", content: "# Readme" },
];

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
    files: initialFiles,
    activeFileId: null,

    addFile: (name, type, parentId) => {
        const newFile: FileNode = {
            id: Date.now().toString(),
            name,
            type,
            parentId,
            content: type === "file" ? "" : undefined,
            isOpen: type === "folder" ? true : undefined,
        };
        set((state) => ({ files: [...state.files, newFile] }));
    },

    deleteFile: (id) => {
        set((state) => ({ files: state.files.filter((f) => f.id !== id) }));
    },

    renameFile: (id, newName) => {
        set((state) => ({
            files: state.files.map((f) => (f.id === id ? { ...f, name: newName } : f)),
        }));
    },

    setActiveFile: (id) => {
        set({ activeFileId: id });
        // Also update editor content
        const file = get().files.find((f) => f.id === id);
        if (file && file.type === "file") {
            // We need to sync with editor store, but this store shouldn't depend on editor store directly?
            // Or we can just let the component handle the sync.
            // Better: The editor store should subscribe to this or vice versa.
            // For now, I'll leave it to the component to sync.
        }
    },

    toggleFolder: (id) => {
        set((state) => ({
            files: state.files.map((f) => (f.id === id ? { ...f, isOpen: !f.isOpen } : f)),
        }));
    },

    updateFileContent: (id, content) => {
        set((state) => ({
            files: state.files.map((f) => (f.id === id ? { ...f, content } : f)),
        }));
    },

    setFiles: (files: FileNode[]) => {
        set({ files });
    },
}));
