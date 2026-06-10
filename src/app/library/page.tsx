import Link from "next/link";
import { Bell, ChevronRight, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LogoutButton } from "@/components/logout-button";
import { FadeIn, ScaleIn } from "@/components/motion-primitives";
import { PromptLibrary } from "@/components/prompt-library";
import { RequestPromptForm } from "@/components/request-prompt-form";
import {
  cheatSheetRows,
  promptKeywords,
  sidebarItems,
  toneRows,
} from "@/lib/content";
import { getPromptWorkspaceData } from "@/lib/prompt-data";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const workspace = await getPromptWorkspaceData();

  return (
    <main className="min-h-screen bg-[var(--color-sky-wash)] text-[var(--color-obsidian)]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-white/80 bg-white/75 p-5 backdrop-blur-xl lg:block">
          <Link href="/" className="mb-8 block">
            <BrandMark />
          </Link>
          <nav className="space-y-1">
            {sidebarItems.map((item, index) => (
              <a
                key={item.label}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
                  index === 0
                    ? "bg-[var(--color-midnight-ink)] text-white"
                    : "text-[var(--color-silver-pine)] hover:bg-white"
                }`}
                href="#"
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-8 rounded-[28px] bg-[var(--color-arctic-mist)] p-5 shadow-[var(--shadow-lg)]">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-yellow)] text-[var(--color-sunburst-yellow)]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-aeonik text-xl tracking-[-0.02em]">Access Active</h2>
            <p className="mt-3 text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
              Semua prompt premium terbuka untuk akun ini.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/80 bg-[rgba(235,245,255,0.86)] px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-silver-pine)]">
                  PromptVault OS
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  User Access
                </div>
                <h1 className="mt-1 font-aeonik text-3xl tracking-[-0.02em] md:text-4xl">
                  Prompt Library
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button className="icon-button" type="button" title="Notifications">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </button>
                <LogoutButton className="secondary-button hidden sm:inline-flex" />
              </div>
            </div>
          </header>

          <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
            <FadeIn className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="rounded-full bg-[var(--color-mint-glaze)] px-4 py-2 text-xs font-semibold text-[var(--color-silver-pine)]">
                    Premium Knowledge Base
                  </span>
                  <span className="ml-2 rounded-full bg-[var(--color-sky-wash)] px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)]">
                    {workspace.source === "supabase" ? "Supabase Data" : "Fallback Data"}
                  </span>
                  <h2 className="mt-5 max-w-3xl font-aeonik text-4xl leading-tight tracking-[-0.02em]">
                    Semua prompt tersimpan rapi berdasarkan tujuan, model AI, dan workflow.
                  </h2>
                  <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-[var(--color-silver-pine)]">
                    Layout dibuat lebih operasional dari Notion: cepat dicari, mudah difilter,
                    dan setiap prompt punya tombol copy langsung.
                  </p>
                </div>
                <RequestPromptForm source={workspace.source} />
              </div>
            </FadeIn>

            <PromptLibrary categories={workspace.categories} prompts={workspace.prompts} source={workspace.source} />

            <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <ScaleIn className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
                <h2 className="font-aeonik text-2xl tracking-[-0.02em]">
                  AI Prompting Cheat Sheet
                </h2>
                <div className="my-6 border-l-4 border-[var(--color-midnight-ink)] bg-[var(--color-arctic-mist)] p-5 text-lg font-medium text-[var(--color-silver-pine)]">
                  Act as a [Role] perform [Task] in [Format]
                </div>
                <div className="overflow-hidden rounded-2xl border border-[rgba(83,88,98,0.16)]">
                  <table className="w-full text-left text-sm font-medium text-[var(--color-silver-pine)]">
                    <thead className="bg-[var(--color-whisper-fade-orange)] text-[var(--color-obsidian)]">
                      <tr>
                        <th className="p-3">Act as a [Role]</th>
                        <th className="p-3">Create a [Task]</th>
                        <th className="p-3">Show as [Format]</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cheatSheetRows.map((row) => (
                        <tr key={row.join("-")} className="border-t border-[rgba(83,88,98,0.12)]">
                          {row.map((cell) => (
                            <td key={cell} className="p-3">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScaleIn>

              <div className="space-y-6">
                <ScaleIn className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8" delay={0.08}>
                  <h2 className="font-aeonik text-2xl tracking-[-0.02em]">
                    Top Keywords for AI Prompting
                  </h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {promptKeywords.map((keyword) => (
                      <label key={keyword} className="flex items-center gap-3 text-sm font-medium text-[var(--color-silver-pine)]">
                        <span className="h-4 w-4 rounded border border-[var(--color-silver-pine)] bg-white" />
                        {keyword}
                      </label>
                    ))}
                  </div>
                </ScaleIn>

                <ScaleIn className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8" delay={0.12}>
                  <h2 className="font-aeonik text-2xl tracking-[-0.02em]">Tone Library</h2>
                  <div className="mt-6 overflow-hidden rounded-2xl border border-[rgba(83,88,98,0.16)]">
                    <table className="w-full text-left text-sm font-medium text-[var(--color-silver-pine)]">
                      <tbody>
                        {toneRows.map(([tone, description]) => (
                          <tr key={tone} className="border-t border-[rgba(83,88,98,0.12)] first:border-t-0">
                            <td className="w-40 bg-[var(--color-arctic-mist)] p-3 font-semibold text-[var(--color-obsidian)]">
                              {tone}
                            </td>
                            <td className="p-3">{description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScaleIn>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
