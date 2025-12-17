"use client";

import Link from "next/link";
import { FolderGit2, Trash2, File, Folder, AlertTriangle, Loader2 } from "lucide-react";
import * as motion from "framer-motion/client";
import { useState, useTransition } from "react";
import { deleteProject, getProjectFiles } from "@/app/actions";
import { FileNode } from "@/store/use-file-system-store";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
    project: {
        id: string;
        name: string;
        createdAt: Date | null;
        userId: string;
    };
    index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectFiles, setProjectFiles] = useState<FileNode[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [isDeleting, startTransition] = useTransition();

    const handleOpenDeleteModal = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        setIsDeleteModalOpen(true);
        setIsLoadingFiles(true);

        try {
            const files = await getProjectFiles(project.id);
            setProjectFiles(files);
        } catch (error) {
            console.error("Failed to load project files", error);
        } finally {
            setIsLoadingFiles(false);
        }
    };

    const handleDelete = async () => {
        startTransition(async () => {
            await deleteProject(project.id);
            setIsDeleteModalOpen(false);
        });
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 + 0.1 }}
            >
                <Link href={`/project/${project.id}`}>
                    <div className="h-full min-h-[200px] bg-card border border-border rounded-xl p-6 flex flex-col justify-between hover:border-primary/50 hover:shadow-[0_0_30px_-10px_rgba(100,255,218,0.1)] transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FolderGit2 size={64} />
                        </div>

                        <div className="space-y-2 z-10 w-full">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate max-w-[80%]">
                                    {project.name}
                                </h3>
                                <button
                                    onClick={handleOpenDeleteModal}
                                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-white/5 opacity-0 group-hover:opacity-100"
                                    title="Delete Project"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">
                                ID: {project.id.slice(0, 8)}...
                            </p>
                        </div>

                        <div className="z-10 pt-8 flex justify-between items-end">
                            <span className="text-xs text-muted-foreground">
                                {new Date(project.createdAt!).toLocaleDateString()}
                            </span>
                            <span className="text-xs font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                OPEN PROJECT &rarr;
                            </span>
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
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
                                Are you sure you want to delete <span className="font-semibold text-foreground">"{project.name}"</span>?
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
                                onClick={() => setIsDeleteModalOpen(false)}
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
            )}
        </>
    );
}
