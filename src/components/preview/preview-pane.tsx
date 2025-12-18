"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/use-editor-store";
import { useFileSystemStore } from "@/store/use-file-system-store";
import { AlertCircle, RefreshCw, Download, Image as ImageIcon, FileText, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

import { MermaidRenderer } from "./mermaid-renderer";
import { PlantUMLRenderer } from "./plantuml-renderer";

export function PreviewPane() {
    const { code, mermaidTheme, setMermaidTheme } = useEditorStore();
    const { activeFileId, files } = useFileSystemStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [svg, setSvg] = useState<string>("");
    const [scale, setScale] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Clear SVG state when active file changes
    useEffect(() => {
        setSvg("");
        setError(null);
    }, [activeFileId]);

    const getFileName = (extension: string) => {
        if (activeFileId) {
            const file = files.find(f => f.id === activeFileId);
            if (file) {
                // Remove existing extension if present
                const name = file.name.replace(/\.[^/.]+$/, "");
                return `${name}.${extension}`;
            }
        }
        return `diagram.${extension}`;
    };

    // SVG state is now handled via callback from MermaidRenderer
    const handleSvgGenerated = (generatedSvg: string) => {
        setSvg(generatedSvg);
        setError(null);
    };

    const handleExportSvg = () => {
        // If it's PlantUML (which renders an SVG string now inside a div), we might need to exact it differently
        // But since we are setting svg state via onSvgGenerated, it should work for both.
        // However, PlantUMLRenderer returns raw SVG string.
        if (!svg) return;

        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = getFileName("svg");
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPng = async () => {
        if (!containerRef.current) return;

        let element: HTMLElement | null = null;

        // 1. Try finding container by data attributes (Preferred as they wrap the SVG with styles)
        const plantUmlContainer = containerRef.current.querySelector("[data-plantuml-container='true']") as HTMLElement;
        const mermaidContainer = containerRef.current.querySelector("[data-mermaid-container='true']") as HTMLElement;

        if (plantUmlContainer) {
            element = plantUmlContainer;
        } else if (mermaidContainer) {
            element = mermaidContainer;
        } else {
            // 2. Fallback to raw SVG
            element = containerRef.current.querySelector("svg") as unknown as HTMLElement;
        }

        if (!element) return;

        try {
            const dataUrl = await toPng(element, { backgroundColor: "#ffffff" });
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = getFileName("png");
            a.click();
        } catch (err) {
            console.error("PNG export error:", err);
        }
    };

    const handleExportPdf = async () => {
        if (!containerRef.current) return;

        let element: HTMLElement | null = null;

        const plantUmlContainer = containerRef.current.querySelector("[data-plantuml-container='true']") as HTMLElement;
        const mermaidContainer = containerRef.current.querySelector("[data-mermaid-container='true']") as HTMLElement;

        if (plantUmlContainer) {
            element = plantUmlContainer;
        } else if (mermaidContainer) {
            element = mermaidContainer;
        } else {
            element = containerRef.current.querySelector("svg") as unknown as HTMLElement;
        }

        if (!element) return;

        try {
            const dataUrl = await toPng(element, { backgroundColor: "#ffffff" });
            const pdf = new jsPDF({
                orientation: "landscape",
            });
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(getFileName("pdf"));
        } catch (err) {
            console.error("PDF export error:", err);
        }
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const zoomIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.1));
    const handleResetZoom = () => setScale(1);

    const startZoomIn = () => {
        handleZoomIn();
        zoomIntervalRef.current = setInterval(handleZoomIn, 100);
    };

    const startZoomOut = () => {
        handleZoomOut();
        zoomIntervalRef.current = setInterval(handleZoomOut, 100);
    };

    const stopZoom = () => {
        if (zoomIntervalRef.current) {
            clearInterval(zoomIntervalRef.current);
            zoomIntervalRef.current = null;
        }
    };

    return (
        <div className="h-full w-full bg-background flex flex-col border-l border-border">
            <div className="h-9 bg-secondary border-b border-border flex items-center px-4 justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">Preview</span>
                    <div className="flex items-center gap-1 bg-background/50 rounded-md border border-border p-0.5">
                        <button
                            onMouseDown={startZoomOut}
                            onMouseUp={stopZoom}
                            onMouseLeave={stopZoom}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Zoom Out (Hold)"
                        >
                            <ZoomOut size={12} className="text-muted-foreground" />
                        </button>
                        <span className="text-[10px] font-mono w-8 text-center text-muted-foreground">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onMouseDown={startZoomIn}
                            onMouseUp={stopZoom}
                            onMouseLeave={stopZoom}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Zoom In (Hold)"
                        >
                            <ZoomIn size={12} className="text-muted-foreground" />
                        </button>
                        <button onClick={handleResetZoom} className="p-1 hover:bg-white/10 rounded transition-colors" title="Reset Zoom">
                            <Maximize size={12} className="text-muted-foreground" />
                        </button>
                    </div>
                    {/* Only show theme selector for Mermaid files */}
                    {(!activeFileId || files.find(f => f.id === activeFileId)?.name.endsWith(".mmd")) && (
                        <select
                            value={mermaidTheme}
                            onChange={(e) => setMermaidTheme(e.target.value)}
                            className="h-6 bg-background border border-border rounded text-xs px-2 text-muted-foreground outline-none focus:border-primary"
                        >
                            <option value="default">Default</option>
                            <option value="neutral">Neutral</option>
                            <option value="dark">Dark</option>
                            <option value="forest">Forest</option>
                            <option value="base">Base</option>
                        </select>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={handleExportSvg} className="p-1 hover:bg-white/10 rounded transition-colors" title="Export SVG">
                        <Download size={14} className="text-muted-foreground" />
                    </button>
                    <button onClick={handleExportPng} className="p-1 hover:bg-white/10 rounded transition-colors" title="Export PNG">
                        <ImageIcon size={14} className="text-muted-foreground" />
                    </button>
                    <button onClick={handleExportPdf} className="p-1 hover:bg-white/10 rounded transition-colors" title="Export PDF">
                        <FileText size={14} className="text-muted-foreground" />
                    </button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <button onClick={handleRefresh} className="p-1 hover:bg-white/10 rounded transition-colors" title="Refresh">
                        <RefreshCw size={14} className="text-muted-foreground" />
                    </button>
                </div>
            </div >
            <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-muted/20 relative">
                {activeFileId && files.find(f => f.id === activeFileId)?.name.endsWith(".puml") ? (
                    <PlantUMLRenderer
                        key={`puml-${refreshTrigger}`}
                        code={code}
                        scale={scale}
                        onSvgGenerated={handleSvgGenerated}
                    />
                ) : (
                    <MermaidRenderer
                        key={`mermaid-${refreshTrigger}`}
                        code={code}
                        scale={scale}
                        theme={mermaidTheme}
                        onSvgGenerated={handleSvgGenerated}
                    />
                )}
            </div>
        </div >
    );
}
