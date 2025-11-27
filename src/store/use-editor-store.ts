import { create } from "zustand";

interface EditorState {
    code: string;
    setCode: (code: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    code: `graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]
    D --> B`,
    setCode: (code) => set({ code }),
}));
