"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useEditorStore } from "@/store/use-editor-store";
import { AlertCircle, RefreshCw, Download, Image as ImageIcon, FileText } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    themeVariables: {
        darkMode: true,
        background: "#0a192f",
        primaryColor: "#112240",
        primaryTextColor: "#e6f1ff",
        primaryBorderColor: "#64ffda",
        lineColor: "#64ffda",
        secondaryColor: "#172a45",
        tertiaryColor: "#112240",
    },
});

export function PreviewPane() {
    const { code } = useEditorStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [svg, setSvg] = useState<string>("");
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const render = async () => {
            if (!containerRef.current) return;

            try {
                // Reset error
                setError(null);

                // Generate a unique ID for the diagram
                const id = `mermaid-${Date.now()}`;

                // Check if code is valid (basic check)
                if (!code.trim()) {
                    setSvg("");
                    return;
                }

                // Render
                const { svg } = await mermaid.render(id, code);
                setSvg(svg);
            } catch (err) {
                console.error("Mermaid render error:", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Unknown error occurred");
                }
            }
        };

        const timeout = setTimeout(render, 500); // Debounce
        return () => clearTimeout(timeout);
    }, [code]);

    const handleExportSvg = () => {
        if (!svg) return;
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "diagram.svg";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPng = async () => {
        if (!containerRef.current) return;
        // We need to target the SVG element inside the container
        const svgElement = containerRef.current.querySelector("svg");
        if (!svgElement) return;

        try {
            const dataUrl = await toPng(svgElement as unknown as HTMLElement, { backgroundColor: "#0a192f" });
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = "diagram.png";
            a.click();
        } catch (err) {
            console.error("PNG export error:", err);
        }
    };

    const handleExportPdf = async () => {
        if (!containerRef.current) return;
        const svgElement = containerRef.current.querySelector("svg");
        if (!svgElement) return;

        try {
            const dataUrl = await toPng(svgElement as unknown as HTMLElement, { backgroundColor: "#0a192f" });
            const pdf = new jsPDF({
                orientation: "landscape",
            });
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("diagram.pdf");
        } catch (err) {
            console.error("PDF export error:", err);
        }
    };

    return (
        <div className="h-full w-full bg-background flex flex-col border-l border-border">
            <div className="h-9 bg-secondary border-b border-border flex items-center px-4 justify-between">
                <span className="text-xs text-muted-foreground">Preview</span>
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
                    <button className="p-1 hover:bg-white/10 rounded transition-colors" title="Refresh">
                        <RefreshCw size={14} className="text-muted-foreground" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-[#0a192f] relative">
                {error && (
                    <div className="absolute top-4 left-4 right-4 bg-destructive/10 border border-destructive text-destructive p-3 rounded text-sm flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <pre className="whitespace-pre-wrap font-mono text-xs">{error}</pre>
                    </div>
                )}

                <div
                    ref={containerRef}
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            </div>
        </div>
    );
}
