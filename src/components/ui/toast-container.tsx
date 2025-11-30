"use client";

import { useToastStore } from "@/store/use-toast-store";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    id={toast.id}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

interface ToastItemProps {
    id: string;
    type: "success" | "error" | "info";
    message: string;
    onClose: () => void;
}

function ToastItem({ id, type, message, onClose }: ToastItemProps) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => {
            setIsExiting(false);
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Match animation duration
    };

    const styles = {
        success: "bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(100,255,218,0.15)]",
        error: "bg-destructive/10 border-destructive text-destructive shadow-[0_0_20px_rgba(239,68,68,0.15)]",
        info: "bg-secondary/80 border-border text-foreground shadow-[0_0_20px_rgba(35,53,84,0.3)]",
    };

    const icon = {
        success: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div
            className={`
                pointer-events-auto
                min-w-[320px] max-w-md
                px-4 py-3
                border backdrop-blur-sm
                rounded
                flex items-start gap-3
                font-mono text-sm
                transition-all duration-300
                ${styles[type]}
                ${isExiting
                    ? "opacity-0 translate-x-8 scale-95"
                    : "opacity-100 translate-x-0 scale-100"
                }
            `}
            style={{
                animation: isExiting ? undefined : "slideInRight 0.3s ease-out",
            }}
        >
            <div className="flex-shrink-0 mt-0.5">{icon[type]}</div>
            <div className="flex-1 leading-relaxed">{message}</div>
            <button
                onClick={handleClose}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>

            <style jsx>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(2rem) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}
