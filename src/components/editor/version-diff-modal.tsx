"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Editor from "@monaco-editor/react";
import { MermaidRenderer } from "@/components/preview/mermaid-renderer";
import { PlantUMLRenderer } from "@/components/preview/plantuml-renderer";
import { X, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEditorStore } from "@/store/use-editor-store";

interface VersionDiffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRestore: (versionId: string) => void;
    currentCode: string;
    snapshotCode: string;
    versionDate: Date;
    versionId: string;
    isRestoring?: boolean;
}

export function VersionDiffModal({
    isOpen,
    onClose,
    onRestore,
    currentCode,
    snapshotCode,
    versionDate,
    versionId,
    isRestoring = false
}: VersionDiffModalProps) {
    const [mounted, setMounted] = useState(false);
    const { theme: currentTheme } = useTheme();
    const { mermaidTheme } = useEditorStore();

    useEffect(() => {
        setMounted(true);

        return () => setMounted(false);
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const content = (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-background border border-border w-[95vw] h-[90vh] shadow-lg rounded-lg flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-secondary/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-semibold">Version Comparison</h2>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded border border-border">
                            <span>Current Version</span>
                            <ArrowRight size={12} />
                            <span>Snapshot ({versionDate.toLocaleString()})</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onRestore(versionId)}
                            disabled={isRestoring}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                "bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {isRestoring ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            Restore This Version
                        </button>
                        <div className="w-px h-6 bg-border mx-2" />
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content - 4 Columns Grid */}
                <div className="flex-1 grid grid-cols-4 divide-x divide-border min-h-0 bg-background">
                    {/* Column 1: Current Preview */}
                    <div className="flex flex-col min-h-0">
                        <div className="h-8 border-b border-border bg-secondary/30 flex items-center px-3 text-xs font-medium text-muted-foreground">
                            Current Preview
                        </div>
                        <div className="flex-1 overflow-auto bg-muted/20 p-4 relative">
                            {currentCode.trim().startsWith("@startuml") ? (
                                <PlantUMLRenderer code={currentCode} scale={0.7} />
                            ) : (
                                <MermaidRenderer code={currentCode} scale={0.7} theme={mermaidTheme} />
                            )}
                        </div>
                    </div>

                    {/* Column 2: Current Code */}
                    <div className="flex flex-col min-h-0">
                        <div className="h-8 border-b border-border bg-secondary/30 flex items-center px-3 text-xs font-medium text-muted-foreground">
                            Current Code
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Editor
                                height="100%"
                                defaultLanguage="markdown"
                                value={currentCode}
                                theme={currentTheme === "light" ? "light" : "abyssal"}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    lineNumbers: "off",
                                    fontSize: 12,
                                    fontFamily: "IBM Plex Mono, monospace",
                                    scrollBeyondLastLine: false,
                                    padding: { top: 16, bottom: 16 },
                                    renderLineHighlight: "none",
                                }}
                            />
                        </div>
                    </div>

                    {/* Column 3: Snapshot Code */}
                    <div className="flex flex-col min-h-0">
                        <div className="h-8 border-b border-border bg-secondary/30 flex items-center px-3 text-xs font-medium text-amber-500/80">
                            Snapshot Code
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Editor
                                height="100%"
                                defaultLanguage="markdown"
                                value={snapshotCode}
                                theme={currentTheme === "light" ? "light" : "abyssal"}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    lineNumbers: "off",
                                    fontSize: 12,
                                    fontFamily: "IBM Plex Mono, monospace",
                                    scrollBeyondLastLine: false,
                                    padding: { top: 16, bottom: 16 },
                                    renderLineHighlight: "none",
                                }}
                            />
                        </div>
                    </div>

                    {/* Column 4: Snapshot Preview */}
                    <div className="flex flex-col min-h-0">
                        <div className="h-8 border-b border-border bg-secondary/30 flex items-center px-3 text-xs font-medium text-amber-500/80">
                            Snapshot Preview
                        </div>
                        <div className="flex-1 overflow-auto bg-muted/20 p-4 relative">
                            {snapshotCode.trim().startsWith("@startuml") ? (
                                <PlantUMLRenderer code={snapshotCode} scale={0.7} />
                            ) : (
                                <MermaidRenderer code={snapshotCode} scale={0.7} theme={mermaidTheme} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (typeof document === "undefined") return null;
    return createPortal(content, document.body);
}
