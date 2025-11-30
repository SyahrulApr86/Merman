"use client";

import React from "react";
import { useFileSystemStore } from "@/store/use-file-system-store";
import { X, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

export function TabBar() {
    const { files, openFileIds, activeFileId, setActiveFile, closeFile } = useFileSystemStore();

    const openFiles = openFileIds
        .map((id) => files.find((f) => f.id === id))
        .filter((f): f is NonNullable<typeof f> => !!f);

    if (openFiles.length === 0) return null;

    return (
        <div className="flex items-center overflow-x-auto bg-secondary border-b border-border h-9">
            {openFiles.map((file) => (
                <div
                    key={file.id}
                    className={cn(
                        "group flex items-center gap-2 px-3 h-full border-r border-border text-xs cursor-pointer select-none min-w-[120px] max-w-[200px]",
                        activeFileId === file.id
                            ? "bg-background text-foreground border-t-2 border-t-primary"
                            : "bg-secondary text-muted-foreground hover:bg-white/5"
                    )}
                    onClick={() => setActiveFile(file.id)}
                >
                    <FileCode size={14} className={cn(
                        "shrink-0",
                        activeFileId === file.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="truncate flex-1">{file.name}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeFile(file.id);
                        }}
                        className="p-0.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
        </div>
    );
}
