import { Sparkles } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-midnight-ink)] text-white shadow-[var(--shadow-subtle)]">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="font-aeonik text-[20px] leading-none tracking-[-0.02em] text-[var(--color-obsidian)]">
          PromptVault OS
        </p>
        <p className="mt-1 text-xs font-medium tracking-[-0.01em] text-[var(--color-silver-pine)]">
          Multi-AI prompt manager
        </p>
      </div>
    </div>
  );
}
