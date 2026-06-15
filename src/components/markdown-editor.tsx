"use client";

import { useRef } from "react";
import { Bold, Italic, Code, SquareSlash } from "lucide-react";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  variableSyntax?: "brackets" | "handlebars";
};

export function MarkdownEditor({ value, onChange, placeholder, rows = 7, variableSyntax = "brackets" }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const varOpen = variableSyntax === "handlebars" ? "{{" : "[";
    const varClose = variableSyntax === "handlebars" ? "}}" : "]";
    
    // If wrapping a variable, default text is "Variabel"
    const textToInsert = selectedText || (after === varClose && before === varOpen ? "Variabel" : "text");
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position inside the wrapper
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + textToInsert.length);
    }, 0);
  };

  return (
    <div className="flex flex-col mt-2 overflow-hidden rounded-2xl border border-[rgba(83,88,98,0.18)] focus-within:border-[var(--color-luminous-blue)] focus-within:ring-1 focus-within:ring-[var(--color-luminous-blue)]">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-[rgba(83,88,98,0.18)] bg-[var(--color-arctic-mist)] px-3 py-2 dark:bg-[var(--color-canvas-white)]/50">
        <button
          type="button"
          onClick={() => insertText("**", "**")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-silver-pine)] hover:bg-[rgba(83,88,98,0.1)] hover:text-[var(--color-obsidian)] transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText("*", "*")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-silver-pine)] hover:bg-[rgba(83,88,98,0.1)] hover:text-[var(--color-obsidian)] transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText("`", "`")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-silver-pine)] hover:bg-[rgba(83,88,98,0.1)] hover:text-[var(--color-obsidian)] transition-colors"
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </button>
        <div className="mx-1 h-4 w-px bg-[rgba(83,88,98,0.18)]" />
        <button
          type="button"
          onClick={() => insertText(variableSyntax === "handlebars" ? "{{" : "[", variableSyntax === "handlebars" ? "}}" : "]")}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-[var(--color-electric-blue)] hover:bg-[var(--color-whisper-fade-blue)] transition-colors"
          title="Sisipkan Variabel"
        >
          <SquareSlash className="h-3.5 w-3.5" />
          <span>{variableSyntax === "handlebars" ? "{{Variabel}}" : "[Variabel]"}</span>
        </button>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        className="w-full resize-y bg-white dark:bg-[var(--color-canvas-white)] p-4 text-sm font-medium leading-relaxed text-[var(--color-obsidian)] outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Tuliskan prompt di sini... Gunakan [Variabel] agar bisa diisi di Playground."}
        rows={rows}
        required
      />
    </div>
  );
}
