import { BarChart3, Copy, TrendingUp } from "lucide-react";
import { FadeIn, LiftCard, Stagger } from "@/components/motion-primitives";
import type { PromptInsightView } from "@/lib/prompt-data";

type PromptAnalyticsPanelProps = {
  insights: PromptInsightView[];
};

export function PromptAnalyticsPanel({ insights }: PromptAnalyticsPanelProps) {
  const maxCopyCount = Math.max(...insights.map((insight) => insight.copyCount), 1);

  return (
    <FadeIn className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-whisper-fade-yellow)] px-4 py-2 text-xs font-semibold text-[var(--color-sunburst-yellow)]">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            Product Ops
          </span>
          <h2 className="mt-4 font-aeonik text-3xl tracking-[-0.02em]">Prompt paling sering dicopy</h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
            Bantu superadmin melihat prompt mana yang paling bernilai untuk member bulan ini.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-sky-wash)] px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)]">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          Monthly copy signals
        </span>
      </div>

      {insights.length > 0 ? (
        <Stagger className="mt-6 grid gap-4 lg:grid-cols-2">
          {insights.map((insight, index) => {
            const width = `${Math.max(12, Math.round((insight.copyCount / maxCopyCount) * 100))}%`;

            return (
              <LiftCard key={insight.promptId} className="rounded-[28px] bg-[var(--color-arctic-mist)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]">
                      Rank {index + 1}
                    </p>
                    <h3 className="mt-2 font-aeonik text-xl leading-tight tracking-[-0.02em]">
                      {insight.title}
                    </h3>
                  </div>
                  <span className="inline-flex min-w-16 items-center justify-center gap-2 rounded-full bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 px-3 py-2 text-sm font-bold text-[var(--color-electric-blue)]">
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    {insight.copyCount}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--color-mint-glaze)] px-3 py-1 text-xs font-semibold text-[var(--color-silver-pine)]">
                    {insight.category}
                  </span>
                  <span className="rounded-full bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 px-3 py-1 text-xs font-semibold text-[var(--color-silver-pine)]">
                    {insight.model}
                  </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10">
                  <div className="h-full rounded-full bg-[var(--color-electric-blue)]" style={{ width }} />
                </div>
              </LiftCard>
            );
          })}
        </Stagger>
      ) : (
        <div className="mt-6 rounded-[28px] bg-[var(--color-arctic-mist)] p-8 text-center text-sm font-semibold text-[var(--color-silver-pine)]">
          Belum ada event copy bulan ini. Setelah member menekan Copy Prompt, ranking akan muncul di sini.
        </div>
      )}
    </FadeIn>
  );
}
