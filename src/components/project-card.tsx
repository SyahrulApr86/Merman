"use client";

import Link from "next/link";
import { FolderGit2, Trash2, File, Folder, AlertTriangle, Loader2 } from "lucide-react";
import * as motion from "framer-motion/client";
import { useState } from "react";
import { deleteProject } from "@/app/actions";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";

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

    const handleOpenDeleteModal = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeleteModalOpen(true);
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

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                projectId={project.id}
                projectName={project.name}
            />
        </>
    );
}
