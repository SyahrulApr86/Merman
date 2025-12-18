"use client";

import React, { useState } from "react";
import * as motion from "framer-motion/client";
import { X, ExternalLink, Check, FileText } from "lucide-react";
import { TEMPLATES, Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (code: string) => void;
}

export function TemplateModal({ isOpen, onClose, onApply }: TemplateModalProps) {
    const [activeTab, setActiveTab] = useState<"mermaid" | "plantuml">("mermaid");

    // Filter templates based on active tab
    const filteredTemplates = TEMPLATES.filter(t => t.type === activeTab);

    const [selectedTemplate, setSelectedTemplate] = useState<Template>(filteredTemplates[0] || TEMPLATES[0]);

    // Update selected template when tab changes if current selection is not in the new tab
    React.useEffect(() => {
        const firstInTab = TEMPLATES.find(t => t.type === activeTab);
        if (firstInTab) {
            setSelectedTemplate(firstInTab);
        }
    }, [activeTab]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="text-primary" />
                        Choose a Template
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar List */}
                    <div className="w-1/3 border-r border-border flex flex-col bg-secondary/20">
                        {/* Tabs */}
                        <div className="grid grid-cols-2 p-2 gap-2 border-b border-border">
                            <button
                                onClick={() => setActiveTab("mermaid")}
                                className={cn(
                                    "px-3 py-2 rounded-md text-sm font-medium transition-colors text-center",
                                    activeTab === "mermaid"
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Mermaid
                            </button>
                            <button
                                onClick={() => setActiveTab("plantuml")}
                                className={cn(
                                    "px-3 py-2 rounded-md text-sm font-medium transition-colors text-center",
                                    activeTab === "plantuml"
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                PlantUML
                            </button>
                        </div>

                        {/* Template List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between group",
                                        selectedTemplate.id === template.id
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span>{template.name}</span>
                                    <div className="flex gap-2">
                                        {template.isNew && (
                                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                                                NEW
                                            </span>
                                        )}
                                        {template.isBeta && (
                                            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30">
                                                BETA
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="w-2/3 flex flex-col h-full bg-background">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2 text-foreground">
                                    {selectedTemplate.name}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {selectedTemplate.description}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                                        Preview Code
                                    </span>
                                    <a
                                        href={selectedTemplate.docsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs flex items-center gap-1 text-primary hover:underline"
                                    >
                                        Official Docs <ExternalLink size={12} />
                                    </a>
                                </div>
                                <div className="bg-secondary/50 border border-border rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                    <pre className="text-foreground/90">
                                        {selectedTemplate.code}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-border bg-secondary/20 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onApply(selectedTemplate.code)}
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <Check size={16} />
                                Apply Template
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
