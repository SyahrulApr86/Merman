"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { AlertCircle, Loader2 } from "lucide-react";

// Initialize mermaid once (if not already done globally, but safe to call)
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
        lineColor: "#ffffff",
        secondaryColor: "#172a45",
        tertiaryColor: "#112240",
    },
});

interface MermaidRendererProps {
    code: string;
    scale?: number;
    className?: string;
    onSvgGenerated?: (svg: string) => void;
}

export function MermaidRenderer({ code, scale = 1, className, onSvgGenerated }: MermaidRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [svg, setSvg] = useState<string>("");
    const [isRendering, setIsRendering] = useState(false);

    useEffect(() => {
        const render = async () => {
            if (!containerRef.current) return;
            
            // Check if code is valid (basic check)
            if (!code.trim()) {
                setSvg("");
                return;
            }

            try {
                setIsRendering(true);
                // Reset error
                setError(null);

                // Generate a unique ID for the diagram
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Render
                // Note: mermaid.render returns a promise that resolves to an object { svg } in newer versions
                const { svg: generatedSvg } = await mermaid.render(id, code);
                setSvg(generatedSvg);
                
                if (onSvgGenerated) {
                    onSvgGenerated(generatedSvg);
                }
            } catch (err) {
                console.error("Mermaid render error:", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Unknown error occurred");
                }
            } finally {
                setIsRendering(false);
            }
        };

        const timeout = setTimeout(render, 500); // Debounce
        return () => clearTimeout(timeout);
    }, [code, onSvgGenerated]);

    return (
        <div className={`relative w-full h-full flex items-center justify-center bg-[#0a192f] ${className || ""}`}>
            {error && (
                <div className="absolute top-4 left-4 right-4 bg-destructive/10 border border-destructive text-destructive p-3 rounded text-sm flex items-start gap-2 z-10">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <pre className="whitespace-pre-wrap font-mono text-xs max-h-32 overflow-auto">{error}</pre>
                </div>
            )}
            
            {isRendering && !svg && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a192f]/50 z-10">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            )}

            <div
                ref={containerRef}
                className="flex items-center justify-center transition-transform duration-200 ease-out origin-center"
                style={{
                    transform: `scale(${scale})`,
                    minWidth: "100%",
                    minHeight: "100%"
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </div>
    );
}
