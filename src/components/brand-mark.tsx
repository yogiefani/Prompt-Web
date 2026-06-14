import { Sparkles } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-[var(--color-midnight-ink)] text-white shadow-[var(--shadow-subtle)]">
        <Sparkles className="h-4.5 w-4.5 sm:h-5 sm:w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="font-aeonik text-lg sm:text-[20px] leading-none tracking-[-0.02em] text-[var(--color-obsidian)] font-bold">
          PromptVault OS
        </p>
        <p className="mt-1 text-[10px] sm:text-xs font-medium tracking-[-0.01em] text-[var(--color-silver-pine)] hidden sm:block">
          Multi-AI prompt manager
        </p>
      </div>
    </div>
  );
}
