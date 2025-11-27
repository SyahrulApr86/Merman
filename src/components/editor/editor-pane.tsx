"use client";

import React, { useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEditorStore } from "@/store/use-editor-store";
import { useFileSystemStore } from "@/store/use-file-system-store";

export function EditorPane() {
    const { code, setCode } = useEditorStore();
    const { activeFileId, updateFileContent, files } = useFileSystemStore();
    const monaco = useMonaco();

    const activeFile = files.find(f => f.id === activeFileId);

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
            <div className="h-9 bg-secondary border-b border-border flex items-center px-4">
                <span className="text-xs text-muted-foreground">
                    {activeFile ? activeFile.name : "No file open"}
                </span>
            </div>
            <div className="flex-1 overflow-hidden">
                {activeFile ? (
                    <Editor
                        height="100%"
                        defaultLanguage="markdown"
                        value={code}
                        onChange={(value) => setCode(value || "")}
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
