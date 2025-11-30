"use client";

import React from "react";
import {
    PanelResizeHandle,
    Panel,
    PanelGroup,
} from "react-resizable-panels";
import { Sidebar } from "./sidebar";
import { EditorPane } from "../editor/editor-pane";
import { PreviewPane } from "../preview/preview-pane";

export function MainLayout({ projectName, projectId }: { projectName?: string; projectId: string }) {
    return (
        <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="h-12 border-b border-border bg-secondary flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <a
                        href="/"
                        className="p-2 hover:bg-white/10 rounded-md text-muted-foreground hover:text-primary transition-colors"
                        title="Back to Dashboard"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </a>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-wide">{projectName || "Untitled Project"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Right side actions if needed */}
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                    <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-secondary">
                        <Sidebar projectId={projectId} />
                    </Panel>

                    <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />

                    <Panel defaultSize={80}>
                        <PanelGroup direction="horizontal">
                            <Panel defaultSize={50} minSize={30}>
                                <EditorPane />
                            </Panel>

                            <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />

                            <Panel defaultSize={50} minSize={30}>
                                <PreviewPane />
                            </Panel>
                        </PanelGroup>
                    </Panel>
                </PanelGroup>
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-primary text-primary-foreground text-xs flex items-center px-4 justify-between shrink-0">
                <span>Ready</span>
                <span>
                    MERMAN<span className="text-white">_IDE</span>
                </span>
            </div>
        </div>
    );
}
