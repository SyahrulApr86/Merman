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

export function MainLayout() {
    return (
        <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
            {/* Header / Title Bar could go here */}

            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                    <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-secondary">
                        <Sidebar />
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
            <div className="h-6 bg-primary text-primary-foreground text-xs flex items-center px-4 justify-between">
                <span>Ready</span>
                <span>Merman IDE</span>
            </div>
        </div>
    );
}
