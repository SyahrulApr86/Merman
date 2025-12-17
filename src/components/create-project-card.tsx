"use client";

import { createProject } from "@/app/actions";
import { Plus, Loader2, ArrowRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { motion } from "framer-motion";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="absolute inset-x-0 bottom-0 h-10 bg-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-medium transition-transform transform translate-y-full group-hover:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                </>
            ) : (
                <>
                    Create Project <ArrowRight className="w-4 h-4" />
                </>
            )}
        </button>
    );
}

export function CreateProjectCard() {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const hasContent = inputValue.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
        >
            <form action={createProject} className="h-full">
                <div
                    className={`h-full min-h-[200px] border-2 border-dashed rounded-xl p-6 flex flex-col justify-center items-center gap-4 transition-all group relative overflow-hidden
            ${isFocused || hasContent ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-white/5"}
          `}
                >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* Icon (Submit Button) */}
                    <button
                        type="submit"
                        className={`z-10 bg-secondary p-4 rounded-full transition-all duration-300 cursor-pointer hover:bg-secondary/80 outline-none focus:ring-2 focus:ring-primary/50
            ${isFocused || hasContent ? "scale-90 opacity-80" : "group-hover:scale-110"}
          `}>
                        <Plus className="text-primary w-8 h-8" />
                    </button>

                    {/* Input */}
                    <div className="z-10 w-full max-w-[200px] relative">
                        <input
                            name="name"
                            placeholder="New Project Name..."
                            className="w-full bg-transparent text-center border-b border-border focus:border-primary outline-none py-2 text-sm placeholder:text-muted-foreground/50 transition-colors"
                            required
                            autoComplete="off"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => setInputValue(e.target.value)}
                            value={inputValue}
                        />
                    </div>

                    {/* Create Button (Visible on hover or when typing) */}
                    <div className={`absolute inset-x-0 bottom-0 overflow-hidden transition-all duration-300
             ${isFocused || hasContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full group-hover:translate-y-0 group-hover:opacity-100"}
           `}>
                        <SubmitButton />
                    </div>
                </div>
            </form>
        </motion.div>
    );
}
