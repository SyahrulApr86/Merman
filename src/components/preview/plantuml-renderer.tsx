"use client";

import React, { useEffect, useState } from "react";
import plantumlEncoder from "plantuml-encoder";
import { Loader2, AlertCircle } from "lucide-react";

interface PlantUMLRendererProps {
    code: string;
    scale?: number;
    className?: string;
}

export function PlantUMLRenderer({ code, scale = 1, className }: PlantUMLRendererProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!code.trim()) {
            setImageUrl(null);
            return;
        }

        setLoading(true);
        try {
            const encoded = plantumlEncoder.encode(code);
            // Point to local docker container exposed on port 8080
            // We use /svg/ to get SVG format
            const url = `http://localhost:8080/svg/${encoded}`;
            setImageUrl(url);
        } catch (error) {
            console.error("Failed to encode PlantUML:", error);
        } finally {
            // Loading false is actually handled by image onLoad, but we set it here 
            // incase encoding fails. Real loading happens when img fetches.
        }
    }, [code]);

    const handleImageLoad = () => {
        setLoading(false);
    };

    const handleImageError = () => {
        setLoading(false);
        // Maybe set error state?
    };

    return (
        <div className={`relative w-full h-full flex items-center justify-center bg-white ${className || ""}`}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            )}

            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt="PlantUML Diagram"
                    className="transition-transform duration-200 ease-out origin-center"
                    style={{
                        transform: `scale(${scale})`,
                        maxWidth: 'none', // Allow scaling beyond container
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
            ) : (
                <div className="text-sm text-muted-foreground">Start typing to generate diagram...</div>
            )}
        </div>
    );
}
