"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEditorStore } from "@/store/use-editor-store";
import { useFileSystemStore } from "@/store/use-file-system-store";
import { cn } from "@/lib/utils";
import { TabBar } from "./tab-bar";
import { TemplateModal } from "./template-modal";
import { VersionDiffModal } from "./version-diff-modal";
import { LayoutTemplate, Wifi, WifiOff, History, Loader2, Save } from "lucide-react";
import { useRealtimeEditor, useFileUpdates } from "@/websocket";
import { useParams } from "next/navigation";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type LoadStatus = "idle" | "loading" | "loaded" | "error";

export function EditorPane() {
    const { code, setCode } = useEditorStore();
    const { activeFileId, updateFileContent, files } = useFileSystemStore();
    const monaco = useMonaco();
    const params = useParams();
    const projectId = params?.id as string | undefined;

    // State
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const [loadStatus, setLoadStatus] = useState<LoadStatus>("idle");
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    
    // Diff Modal State
    const [diffModalOpen, setDiffModalOpen] = useState(false);
    const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
    const [snapshotCode, setSnapshotCode] = useState("");
    const [selectedVersionDate, setSelectedVersionDate] = useState<Date>(new Date());
    const [isRestoringVersion, setIsRestoringVersion] = useState(false);

    console.log("RENDER EditorPane: diffModalOpen =", diffModalOpen);

    // Refs
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastEditedFileIdRef = useRef<string | null>(null);
    const activeFileIdRef = useRef<string | null>(activeFileId);
    const filesRef = useRef(files);
    const isLoadingFromServerRef = useRef(false);

    // WebSocket connection
    const {
        isConnected,
        connectionStatus,
        updateFile: wsUpdateFile,
        loadFile: wsLoadFile,
        getVersionContent,
        restoreVersion,
    } = useRealtimeEditor(projectId || null);

    // Keep filesRef in sync
    useEffect(() => {
        filesRef.current = files;
    }, [files]);

    const activeFile = files.find((f) => f.id === activeFileId);

    // Listen for file updates from other users
    useFileUpdates(
        useCallback(
            (event) => {
                // If the update is for the active file and from another user
                if (event.fileId === activeFileId) {
                    console.log("File updated by another user:", event);
                    // Optionally reload the file
                }
            },
            [activeFileId]
        )
    );

    // Load file content when active file changes
    useEffect(() => {
        activeFileIdRef.current = activeFileId;
        setSaveStatus("idle");

        if (!activeFileId) return;

        const file = filesRef.current.find((f) => f.id === activeFileId);
        if (!file || file.type !== "file") return;

        // If WebSocket is connected, load from MinIO
        if (isConnected && projectId) {
            isLoadingFromServerRef.current = true;
            setLoadStatus("loading");

            wsLoadFile(activeFileId)
                .then((response) => {
                    if (response.content !== undefined) {
                        setCode(response.content);
                        updateFileContent(activeFileId, response.content);
                    }
                    setLoadStatus("loaded");
                })
                .catch((error) => {
                    console.error("Failed to load from WebSocket:", error);
                    // Fallback to local content
                    setCode(file.content || "");
                    setLoadStatus("error");
                })
                .finally(() => {
                    isLoadingFromServerRef.current = false;
                });
        } else {
            // Fallback to local content
            setCode(file.content || "");
        }
    }, [activeFileId, setCode, isConnected, projectId, wsLoadFile, updateFileContent]);

    // Handle editor content changes
    const handleEditorChange = useCallback(
        (value: string | undefined) => {
            const newValue = value || "";

            // Skip if we're loading from server
            if (isLoadingFromServerRef.current) return;

            setCode(newValue);

            if (!activeFileId) return;

            const currentFile = filesRef.current.find((f) => f.id === activeFileId);
            if (!currentFile || currentFile.type !== "file") return;

            // Update local store immediately
            updateFileContent(activeFileId, newValue);

            setSaveStatus("saving");

            // Clear previous timeout if editing the same file
            if (lastEditedFileIdRef.current === activeFileId && saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            lastEditedFileIdRef.current = activeFileId;

            // Debounced save
            const timeoutId = setTimeout(async () => {
                try {
                    if (isConnected && projectId) {
                        // Save via WebSocket + MinIO
                        await wsUpdateFile({
                            fileId: activeFileId,
                            content: newValue,
                            projectId,
                        });
                    } else {
                        // Fallback: Save via HTTP (server action)
                        const { updateFileContent: updateFileContentAction } = await import(
                            "@/app/actions"
                        );
                        await updateFileContentAction(activeFileId, newValue);
                    }

                    if (activeFileIdRef.current === activeFileId) {
                        setSaveStatus("saved");
                        // Reset to idle after 2 seconds
                        setTimeout(() => {
                            if (activeFileIdRef.current === activeFileId) {
                                setSaveStatus("idle");
                            }
                        }, 2000);
                    }
                } catch (error) {
                    console.error("Failed to save:", error);
                    if (activeFileIdRef.current === activeFileId) {
                        setSaveStatus("error");
                    }
                }
            }, 300); // Reduced debounce time since WebSocket is faster

            saveTimeoutRef.current = timeoutId;
        },
        [activeFileId, setCode, updateFileContent, isConnected, projectId, wsUpdateFile]
    );

    // Handle manual version creation
    const handleSaveVersion = useCallback(async () => {
        if (!activeFileId || !projectId || !isConnected) return;
        
        try {
            setSaveStatus("saving");
            await wsUpdateFile({
                fileId: activeFileId,
                content: code,
                projectId,
                createVersion: true,
            });
            setSaveStatus("saved");
            
            // Show success momentarily
            setTimeout(() => {
                setSaveStatus(prev => prev === "saved" ? "idle" : prev);
            }, 2000);
            
            // If history is open, it will auto-update if we add a refresh mechanism later
            // For now user can toggle history to refresh
        } catch (error) {
            console.error("Failed to create version:", error);
            setSaveStatus("error");
        }
    }, [activeFileId, projectId, isConnected, code, wsUpdateFile]);

    // Monaco theme setup
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

    // Get save status text and color
    const getSaveStatusDisplay = () => {
        switch (saveStatus) {
            case "saving":
                return { text: "Saving...", color: "text-yellow-500" };
            case "saved":
                return { text: "Saved", color: "text-green-500" };
            case "error":
                return { text: "Error saving", color: "text-red-500" };
            default:
                return null;
        }
    };

    const statusDisplay = getSaveStatusDisplay();

    return (
        <div className="h-full w-full bg-background flex flex-col">
            <TabBar />
            <div className="h-9 bg-secondary border-b border-border flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    {/* Connection status indicator */}
                    <div
                        className={cn(
                            "flex items-center gap-1.5 text-xs transition-colors",
                            !isConnected && "text-muted-foreground",
                            isConnected && saveStatus === "error" ? "text-red-500" : "text-green-500"
                        )}
                        title={
                            isConnected
                                ? "Real-time sync enabled"
                                : `Connection: ${connectionStatus}`
                        }
                    >
                        {!isConnected ? (
                            <WifiOff size={12} />
                        ) : (
                            <Wifi size={12} />
                        )}
                        <span className="hidden sm:inline">
                            {!isConnected ? "Offline" : (saveStatus === "error" ? "Sync Error" : "Live")}
                        </span>
                    </div>

                    <span className="text-xs text-muted-foreground">
                        {activeFile ? activeFile.name : "No file open"}
                    </span>

                    {activeFile && (
                        <>
                            <button
                                onClick={() => setIsTemplateModalOpen(true)}
                                disabled={code.trim().length > 0}
                                className={cn(
                                    "text-xs px-2 py-0.5 rounded border transition-all flex items-center gap-1.5",
                                    code.trim().length > 0
                                        ? "opacity-50 cursor-not-allowed border-transparent text-muted-foreground"
                                        : "border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                                )}
                                title={
                                    code.trim().length > 0
                                        ? "Clear editor to use templates"
                                        : "Choose a template"
                                }
                            >
                                <LayoutTemplate size={12} />
                                Templates
                            </button>

                            {/* Save Version Button */}
                            {isConnected && (
                                <button
                                    onClick={handleSaveVersion}
                                    className={cn(
                                        "text-xs px-2 py-0.5 rounded border transition-all flex items-center gap-1.5",
                                        "border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                    )}
                                    title="Save new version (Snapshot)"
                                >
                                    <Save size={12} />
                                    Save Version
                                </button>
                            )}

                            {/* Version History Button */}
                            {isConnected && (
                                <button
                                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                                    className={cn(
                                        "text-xs px-2 py-0.5 rounded border transition-all flex items-center gap-1.5",
                                        "border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                    )}
                                    title="View version history"
                                >
                                    <History size={12} />
                                    History
                                </button>
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Loading indicator */}
                    {loadStatus === "loading" && (
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                            <Loader2 size={12} className="animate-spin" />
                            Loading...
                        </span>
                    )}

                    {/* Save status (Offline only) */}
                    {!isConnected && activeFile && statusDisplay && (
                        <span className={cn("text-xs transition-colors", statusDisplay.color)}>
                            {statusDisplay.text}
                        </span>
                    )}
                </div>
            </div>

            <TemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onApply={(templateCode) => {
                    setCode(templateCode);
                    setIsTemplateModalOpen(false);
                }}
            />

            <div className="flex-1 overflow-hidden flex">
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

                {/* Version History Panel */}
                {showVersionHistory && activeFile && (
                    <div className="w-64 border-l border-border bg-secondary overflow-hidden">
                        <VersionHistoryPanel
                            fileId={activeFile.id}
                            onSelectVersion={async (version) => {
                                console.log("Selecting version:", version.id);
                                try {
                                    const response = await getVersionContent(version.id);
                                    console.log("Version content response:", response);
                                    
                                    if (response.success) {
                                        console.log("✅ Success! Opening modal...");
                                        setSnapshotCode(response.content || "");
                                        setSelectedVersionId(version.id);
                                        setSelectedVersionDate(new Date(version.createdAt));
                                        setDiffModalOpen(true);
                                        console.log("setDiffModalOpen(true) called.");
                                    } else {
                                        console.error("Failed response:", response);
                                        // TODO: Show toast error (need toast component)
                                    }
                                } catch (error) {
                                    console.error("Failed to load version content:", error);
                                }
                            }}
                            onClose={() => setShowVersionHistory(false)}
                        />
                    </div>
                )}
            </div>

            {/* Version Diff Modal */}
            <VersionDiffModal
                isOpen={diffModalOpen}
                onClose={() => setDiffModalOpen(false)}
                onRestore={async (versionId) => {
                    setIsRestoringVersion(true);
                    try {
                        const response = await restoreVersion(activeFileId || "", versionId);
                        if (response.content) {
                            setCode(response.content);
                            if (activeFileId) updateFileContent(activeFileId, response.content);
                            setDiffModalOpen(false);
                            setShowVersionHistory(false);
                        }
                    } catch (error) {
                        console.error("Failed to restore version:", error);
                    } finally {
                        setIsRestoringVersion(false);
                    }
                }}
                currentCode={code}
                snapshotCode={snapshotCode}
                versionDate={selectedVersionDate}
                versionId={selectedVersionId || ""}
                isRestoring={isRestoringVersion}
            />
        </div>
    );
}

// Version History Panel Component (inline for now)
interface VersionHistoryPanelProps {
    fileId: string;
    onSelectVersion: (version: { id: string; createdAt: Date }) => void;
    onClose: () => void;
}

function VersionHistoryPanel({ fileId, onSelectVersion, onClose }: VersionHistoryPanelProps) {
    const [versions, setVersions] = useState<Array<{
        id: string;
        size: number;
        createdAt: Date;
        comment: string | null;
    }>>([]);
    const [loadingVersionId, setLoadingVersionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { getVersions } = useRealtimeEditor(null);

    useEffect(() => {
        setIsLoading(true);
        getVersions(fileId)
            .then((response) => {
                if (response.versions) {
                    setVersions(response.versions);
                }
            })
            .catch((error) => {
                console.error("Failed to load versions:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [fileId, getVersions]);

    return (
        <div className="h-full flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium">Version History</span>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground"
                >
                    ×
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    </div>
                ) : versions.length === 0 ? (
                    <div className="text-xs text-muted-foreground p-4 text-center">
                        No version history available
                    </div>
                ) : (
                    <div className="space-y-2">
                        {versions.map((version) => (
                            <div
                                key={version.id}
                                className="p-2 border border-border rounded hover:bg-background transition-colors"
                            >
                                <div className="text-xs font-mono text-muted-foreground">
                                    {new Date(version.createdAt).toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {(version.size / 1024).toFixed(2)} KB
                                </div>
                                {version.comment && (
                                    <div className="text-xs mt-1 truncate">{version.comment}</div>
                                )}
                                <button
                                    onClick={async () => {
                                        setLoadingVersionId(version.id);
                                        await onSelectVersion(version);
                                        setLoadingVersionId(null);
                                    }}
                                    disabled={loadingVersionId === version.id}
                                    className="mt-2 text-xs text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                                >
                                    {loadingVersionId === version.id ? (
                                        <>
                                            <Loader2 size={10} className="animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        "View & Restore"
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
