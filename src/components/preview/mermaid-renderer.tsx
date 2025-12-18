"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { AlertCircle, Loader2 } from "lucide-react";

interface MermaidRendererProps {
    code: string;
    scale?: number;
    className?: string;
    theme?: string;
    onSvgGenerated?: (svg: string) => void;
}

const getThemeBackground = (theme: string) => {
    switch (theme) {
        case 'dark':
            return '#0a192f'; // Matches App Dark BG
        case 'forest':
            return '#1e1e1e'; // Darker gray for forest
        default:
            return '#ffffff'; // White for default/neutral/base
    }
};

export function MermaidRenderer({ code, scale = 1, className, theme = "default", onSvgGenerated }: MermaidRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [svg, setSvg] = useState<string>("");
    const [isRendering, setIsRendering] = useState(false);

    useEffect(() => {
        let isMounted = true;

        // Initialize mermaid with selected theme
        // We use startOnLoad: false so we can manually render
        mermaid.initialize({
            startOnLoad: false,
            theme: theme as any,
            securityLevel: "loose",
            // Clean up theme variables if switching away from custom/dark
            themeVariables: theme === "base" ? {
                // Example base tweaks if needed, otherwise empty
            } : undefined
        });

        // Re-render when code or theme changes
        const render = async () => {
            if (!containerRef.current) return;

            // Check if code is valid (basic check)
            if (!code.trim()) {
                if (isMounted) setSvg("");
                return;
            }

            try {
                if (isMounted) {
                    setIsRendering(true);
                    setError(null);
                }

                // Generate a unique ID for the diagram
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Render
                const { svg: generatedSvg } = await mermaid.render(id, code);

                if (isMounted) {
                    setSvg(generatedSvg);
                    if (onSvgGenerated) {
                        onSvgGenerated(generatedSvg);
                    }
                }
            } catch (err) {
                console.error("Mermaid render error:", err);
                if (isMounted) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError("Unknown error occurred");
                    }
                }
            } finally {
                if (isMounted) setIsRendering(false);
            }
        };

        const timeout = setTimeout(render, 500); // Debounce
        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, [code, theme, onSvgGenerated]); // Re-run when theme changes

    return (
        <div
            className={`relative w-full h-full flex items-center justify-center transition-colors duration-300 ${className || ""}`}
            style={{ backgroundColor: getThemeBackground(theme) }}
        >
            {error && (
                <div className="absolute top-4 left-4 right-4 bg-destructive/10 border border-destructive text-destructive p-3 rounded text-sm flex items-start gap-2 z-10 transition-opacity">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <pre className="whitespace-pre-wrap font-mono text-xs max-h-32 overflow-auto">{error}</pre>
                </div>
            )}

            {isRendering && !svg && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            )}

            <div
                ref={containerRef}
                id="diagram-export-target"
                data-mermaid-container="true"
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
