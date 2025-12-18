"use client";

import React, { useEffect, useState } from "react";
import plantumlEncoder from "plantuml-encoder";
import { Loader2, AlertCircle } from "lucide-react";

interface PlantUMLRendererProps {
    code: string;
    scale?: number;
    className?: string;
    onSvgGenerated?: (svg: string) => void;
}

export function PlantUMLRenderer({ code, scale = 1, className, onSvgGenerated }: PlantUMLRendererProps) {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchSvg = async () => {
            if (!code.trim()) {
                if (isMounted) setSvgContent(null);
                return;
            }

            if (isMounted) {
                setLoading(true);
                setError(null);
            }
            try {
                const encoded = plantumlEncoder.encode(code);
                const url = `http://localhost:8080/svg/${encoded}`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch diagram: ${response.statusText}`);
                }

                const text = await response.text();

                if (isMounted) {
                    setSvgContent(text);
                    if (onSvgGenerated) {
                        onSvgGenerated(text);
                    }
                }
            } catch (err) {
                console.error("Failed to load PlantUML:", err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load diagram");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        const timeout = setTimeout(fetchSvg, 500);
        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, [code, onSvgGenerated]);

    return (
        <div className={`relative w-full h-full flex items-center justify-center bg-white ${className || ""}`}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            )}

            {error && (
                <div className="absolute top-4 left-4 right-4 bg-destructive/10 border border-destructive text-destructive p-3 rounded text-sm flex items-start gap-2 z-10 max-w-sm mx-auto">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {svgContent ? (
                <div
                    id="diagram-export-target"
                    data-plantuml-container="true"
                    className="transition-transform duration-200 ease-out origin-center"
                    style={{
                        transform: `scale(${scale})`,
                        minWidth: "100%",
                        minHeight: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                />
            ) : (
                !loading && <div className="text-sm text-muted-foreground">Start typing to generate diagram...</div>
            )}
        </div>
    );
}
