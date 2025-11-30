"use client";

import { useEffect } from "react";
import { useFileSystemStore, FileNode } from "@/store/use-file-system-store";

export function ProjectInitializer({ files }: { files: FileNode[] }) {
    const { setFiles } = useFileSystemStore();

    useEffect(() => {
        setFiles(files);
    }, [files, setFiles]);

    return null;
}
