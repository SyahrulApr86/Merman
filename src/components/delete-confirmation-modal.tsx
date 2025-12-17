"use client";

import { AlertTriangle, Loader2, Folder, File, Trash2 } from "lucide-react";
import * as motion from "framer-motion/client";
import { useState, useTransition, useEffect } from "react";
import { deleteProject, getProjectFiles } from "@/app/actions";
import { FileNode } from "@/store/use-file-system-store";
import { useRouter } from "next/navigation";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
}

export function DeleteConfirmationModal({ isOpen, onClose, projectId, projectName }: DeleteConfirmationModalProps) {
    const [projectFiles, setProjectFiles] = useState<FileNode[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [isDeleting, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            loadFiles();
        }
    }, [isOpen]);

    const loadFiles = async () => {
        setIsLoadingFiles(true);
        try {
            const files = await getProjectFiles(projectId);
            setProjectFiles(files);
        } catch (error) {
            console.error("Failed to load project files", error);
        } finally {
            setIsLoadingFiles(false);
        }
    };

    const handleDelete = async () => {
        startTransition(async () => {
            await deleteProject(projectId);
            onClose();
            // Force external navigation if we are inside the project page, 
            // but the server action revalidatePath("/") might handle dashboard updates.
            // If we are on the project page, we likely want to go back to dashboard.
            router.push("/");
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl space-y-6"
            >
                <div className="space-y-2 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-destructive/10 rounded-full">
                            <AlertTriangle className="text-destructive w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Delete Project?</h2>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete <span className="font-semibold text-foreground">"{projectName}"</span>?
                        This action cannot be undone.
                    </p>
                </div>

                <div className="space-y-3">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Project Contents:</p>
                    <div className="bg-secondary/50 rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2 border border-border/50">
                        {isLoadingFiles ? (
                            <div className="flex items-center justify-center py-4 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Loading files...
                            </div>
                        ) : projectFiles.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-2">No files found.</p>
                        ) : (
                            projectFiles.map((file) => (
                                <div key={file.id} className="flex items-center gap-2 text-sm text-foreground/80">
                                    {file.type === 'folder' ? (
                                        <Folder size={14} className="text-primary" />
                                    ) : (
                                        <File size={14} className="text-muted-foreground" />
                                    )}
                                    <span className="truncate">{file.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Project"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
