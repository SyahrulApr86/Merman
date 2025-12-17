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
    isOptimistic?: boolean;
}

interface FileSystemState {
    files: FileNode[];
    activeFileId: string | null;
    openFileIds: string[];
    addFile: (name: string, type: FileType, parentId: string | null, id?: string) => void;
    deleteFile: (id: string) => void;
    renameFile: (id: string, newName: string) => void;
    setActiveFile: (id: string) => void;
    closeFile: (id: string) => void;
    toggleFolder: (id: string) => void;
    updateFileContent: (id: string, content: string) => void;
    setFiles: (files: FileNode[]) => void;
    moveFile: (id: string, newParentId: string | null) => void;
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
    openFileIds: [],

    addFile: (name: string, type: FileType, parentId: string | null, id?: string) => {
        const newFile: FileNode = {
            id: id || crypto.randomUUID(),
            name,
            type,
            parentId,
            content: type === "file" ? "" : undefined,
            isOpen: type === "folder" ? true : undefined,
            isOptimistic: true,
        };
        set((state) => ({ files: [...state.files, newFile] }));
    },

    deleteFile: (id) => {
        set((state) => {
            const newOpenFileIds = state.openFileIds.filter(fid => fid !== id);
            let newActiveFileId = state.activeFileId;

            if (state.activeFileId === id) {
                newActiveFileId = newOpenFileIds.length > 0 ? newOpenFileIds[newOpenFileIds.length - 1] : null;
            }

            return {
                files: state.files.filter((f) => f.id !== id),
                openFileIds: newOpenFileIds,
                activeFileId: newActiveFileId
            };
        });
    },

    renameFile: (id, newName) => {
        set((state) => ({
            files: state.files.map((f) => (f.id === id ? { ...f, name: newName } : f)),
        }));
    },

    setActiveFile: (id) => {
        set((state) => {
            const isOpen = state.openFileIds.includes(id);
            return {
                activeFileId: id,
                openFileIds: isOpen ? state.openFileIds : [...state.openFileIds, id]
            };
        });
    },

    closeFile: (id) => {
        set((state) => {
            const newOpenFileIds = state.openFileIds.filter(fid => fid !== id);
            let newActiveFileId = state.activeFileId;

            if (state.activeFileId === id) {
                // If closing active file, switch to the last one in the list, or null if empty
                newActiveFileId = newOpenFileIds.length > 0 ? newOpenFileIds[newOpenFileIds.length - 1] : null;
            }

            return {
                openFileIds: newOpenFileIds,
                activeFileId: newActiveFileId
            };
        });
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

    setFiles: (serverFiles: FileNode[]) => {
        set((state) => {
            // Keep optimistic files that are not yet in the server list
            const optimisticFiles = state.files.filter(f =>
                f.isOptimistic && !serverFiles.some(sf => sf.id === f.id)
            );

            return {
                files: [...serverFiles, ...optimisticFiles],
                // Don't reset activeFileId if it points to a valid file (optimistic or server)
                openFileIds: state.openFileIds,
                // We might want to keep the active file if it still exists
                activeFileId: state.activeFileId
            };
        });
    },

    moveFile: (id, newParentId) => {
        set((state) => ({
            files: state.files.map((f) => (f.id === id ? { ...f, parentId: newParentId } : f)),
        }));
    },
}));
