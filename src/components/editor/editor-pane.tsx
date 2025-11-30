"use client";

import React, { useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEditorStore } from "@/store/use-editor-store";
import { useFileSystemStore } from "@/store/use-file-system-store";
import { cn } from "@/lib/utils";

export function EditorPane() {
    const { code, setCode } = useEditorStore();
    const { activeFileId, updateFileContent, files } = useFileSystemStore();
    const monaco = useMonaco();
    const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "error">("saved");
    const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const lastEditedFileIdRef = React.useRef<string | null>(null);
    const activeFileIdRef = React.useRef<string | null>(activeFileId);

    const activeFile = files.find(f => f.id === activeFileId);

    // Update ref when activeFileId changes
    useEffect(() => {
        activeFileIdRef.current = activeFileId;
        setSaveStatus("saved"); // Reset status on file switch
    }, [activeFileId]);

    const handleEditorChange = (value: string | undefined) => {
        const newValue = value || "";
        setCode(newValue);

        if (!activeFileId || !activeFile || activeFile.type !== "file") return;

        setSaveStatus("saving");

        // Only clear timeout if we are editing the SAME file
        if (lastEditedFileIdRef.current === activeFileId && saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        lastEditedFileIdRef.current = activeFileId;

        const timeoutId = setTimeout(async () => {
            try {
                const { updateFileContent: updateFileContentAction } = await import("@/app/actions");
                await updateFileContentAction(activeFileId, newValue);

                // Only update status if we are still on the same file
                if (activeFileIdRef.current === activeFileId) {
                    setSaveStatus("saved");
                }
            } catch (error) {
                console.error("Failed to save:", error);
                if (activeFileIdRef.current === activeFileId) {
                    setSaveStatus("error");
                }
            }
        }, 1000);

        saveTimeoutRef.current = timeoutId;
    };

    // Sync local store
    useEffect(() => {
        if (activeFileId && code) {
            updateFileContent(activeFileId, code);
        }
    }, [code, activeFileId, updateFileContent]);

    useEffect(() => {
        if (monaco) {
            monaco.editor.defineTheme("abyssal", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                    "editor.background": "#0a192f",
                    "editor.foreground": "#e6f1ff",
                    "editor.lineHighlightBackground": "#112240",
                    "editorLineNumber.foreground": "#8892b0",
                    "editor.selectionBackground": "#233554",
                    "editorCursor.foreground": "#64ffda",
                },
            });
            monaco.editor.setTheme("abyssal");
        }
    }, [monaco]);

    return (
        <div className="h-full w-full bg-background flex flex-col">
            <div className="h-9 bg-secondary border-b border-border flex items-center px-4 justify-between">
                <span className="text-xs text-muted-foreground">
                    {activeFile ? activeFile.name : "No file open"}
                </span>
                {activeFile && (
                    <span className={cn(
                        "text-xs transition-colors",
                        saveStatus === "saving" && "text-yellow-500",
                        saveStatus === "saved" && "text-green-500",
                        saveStatus === "error" && "text-red-500"
                    )}>
                        {saveStatus === "saving" && "Saving..."}
                        {saveStatus === "saved" && "Saved"}
                        {saveStatus === "error" && "Error saving"}
                    </span>
                )}
            </div>
            <div className="flex-1 overflow-hidden">
                {activeFile ? (
                    <Editor
                        height="100%"
                        defaultLanguage="markdown"
                        value={code}
                        onChange={handleEditorChange}
                        theme="abyssal"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "IBM Plex Mono, monospace",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 16, bottom: 16 },
                        }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        Select a file to edit
                    </div>
                )}
            </div>
        </div>
    );
}
