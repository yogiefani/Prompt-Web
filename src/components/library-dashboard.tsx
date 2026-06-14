"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  BookText,
  FileText,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LogoutButton } from "@/components/logout-button";
import { FadeIn } from "@/components/motion-primitives";
import { PromptLibrary } from "@/components/prompt-library";
import { RequestPromptForm } from "@/components/request-prompt-form";
import { BlogList } from "@/components/blog-list";
import { PromptStudio } from "@/components/prompt-studio";
import { cheatSheetRows, promptKeywords, toneRows } from "@/lib/content";
import type { PromptWorkspaceData } from "@/lib/prompt-data";
import type { BlogPostListItem } from "@/lib/blog-data";

type TabId = "library" | "studio" | "tutorials" | "cheat-sheet" | "tone";

export function LibraryDashboard({
  workspace,
  isSuperadmin,
  blogPosts,
}: {
  workspace: PromptWorkspaceData;
  isSuperadmin: boolean;
  blogPosts: BlogPostListItem[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>("library");

  const sidebarMenu: { id: TabId; label: string; icon: typeof FileText; badge?: number }[] = [
    { id: "library", label: "Prompt Library", icon: FileText },
    { id: "studio", label: "AI Prompt Studio", icon: Sparkles },
    { id: "tutorials", label: "Tutorials", icon: BookText, badge: blogPosts.length > 0 ? blogPosts.length : undefined },
    { id: "cheat-sheet", label: "Cheat Sheet", icon: BookOpen },
    { id: "tone", label: "Tone Library", icon: MessageSquareText },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
      {/* Sidebar Kiri (Desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/80 bg-white/75 p-5 backdrop-blur-xl lg:flex">
        <Link href="/" className="mb-8 block">
          <BrandMark />
        </Link>
        <nav className="flex-1 space-y-1.5">
          {sidebarMenu.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[var(--color-midnight-ink)] text-white shadow-[var(--shadow-subtle)]"
                    : "text-[var(--color-silver-pine)] hover:bg-white hover:text-[var(--color-obsidian)]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
                  {item.label}
                </span>
                {item.badge ? (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]"}`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
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

      {/* Main Content Area */}
      <section className="flex min-w-0 flex-col">
        {/* Header & Navigasi Mobile */}
        <header className="sticky top-0 z-30 border-b border-white/80 bg-[rgba(235,245,255,0.86)] px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-silver-pine)]">
                PromptVault OS
                <span className="mx-1 text-gray-300">/</span>
                User Access
              </div>
              <h1 className="mt-1 font-aeonik text-3xl tracking-[-0.02em] text-[var(--color-obsidian)] md:text-4xl">
                {sidebarMenu.find((m) => m.id === activeTab)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isSuperadmin && (
                <Link
                  href="/superadmin"
                  className="secondary-button inline-flex items-center gap-2 border-purple-200 font-semibold hover:border-purple-300"
                >
                  <ShieldCheck className="h-4 w-4 text-[var(--color-deep-violet)]" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
              )}
              <button className="icon-button hidden sm:flex" type="button" title="Notifications">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </button>
              <LogoutButton className="secondary-button inline-flex py-2 px-3 text-xs sm:text-sm sm:py-2.5 sm:px-4" />
            </div>
          </div>

          {/* Tab Navigation for Mobile & Tablet */}
          <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
            {sidebarMenu.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  type="button"
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "border-transparent bg-[var(--color-midnight-ink)] text-white"
                      : "border-[rgba(83,88,98,0.12)] bg-white text-[var(--color-silver-pine)]"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                  {item.badge ? (
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${isActive ? "bg-white/20 text-white" : "bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]"}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="w-full max-w-7xl flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
          {activeTab === "library" && (
            <FadeIn className="space-y-8">
              <div className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <span className="rounded-full bg-[var(--color-mint-glaze)] px-4 py-2 text-xs font-semibold text-[var(--color-silver-pine)]">
                      Premium Knowledge Base
                    </span>
                    <h2 className="mt-5 max-w-3xl font-aeonik text-4xl leading-tight tracking-[-0.02em]">
                      Semua prompt tersimpan rapi berdasarkan tujuan, model AI, dan workflow.
                    </h2>
                    <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-[var(--color-silver-pine)]">
                      Layout dibuat lebih operasional dari Notion: cepat dicari, mudah difilter,
                      dan setiap prompt punya tombol copy langsung.
                    </p>
                  </div>
                  {!isSuperadmin && <RequestPromptForm source={workspace.source} />}
                </div>
              </div>
              <PromptLibrary
                categories={workspace.categories}
                prompts={workspace.prompts}
                source={workspace.source}
              />
            </FadeIn>
          )}

          {activeTab === "studio" && (
            <FadeIn key="studio" className="h-full">
              <PromptStudio generators={workspace.generators || []} />
            </FadeIn>
          )}

          {activeTab === "tutorials" && (
            <FadeIn className="space-y-8">
              <div className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
                <div className="flex flex-col gap-2">
                  <span className="w-fit rounded-full bg-[var(--color-whisper-fade-blue)] px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)]">
                    Tutorial & Panduan
                  </span>
                  <h2 className="mt-3 max-w-2xl font-aeonik text-4xl leading-tight tracking-[-0.02em]">
                    Pelajari cara kerja AI prompting dari nol sampai mahir.
                  </h2>
                  <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-[var(--color-silver-pine)]">
                    Artikel tutorial eksklusif yang dibuat khusus untuk member PromptVault OS.
                  </p>
                </div>
              </div>
              <BlogList posts={blogPosts} />
            </FadeIn>
          )}

          {activeTab === "cheat-sheet" && (
            <FadeIn className="space-y-6">
              <div className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
                <h2 className="font-aeonik text-2xl tracking-[-0.02em]">
                  AI Prompting Cheat Sheet
                </h2>
                <div className="my-6 border-l-4 border-[var(--color-midnight-ink)] bg-[var(--color-arctic-mist)] p-5 text-lg font-medium text-[var(--color-silver-pine)]">
                  Act as a [Role] perform [Task] in [Format]
                </div>
                <div className="overflow-x-auto rounded-2xl border border-[rgba(83,88,98,0.16)]">
                  <table className="min-w-[600px] w-full text-left text-sm font-medium text-[var(--color-silver-pine)]">
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
              </div>

              <div className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
                <h2 className="font-aeonik text-2xl tracking-[-0.02em]">
                  Top Keywords for AI Prompting
                </h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {promptKeywords.map((keyword) => (
                    <label
                      key={keyword}
                      className="flex items-center gap-3 text-sm font-medium text-[var(--color-silver-pine)]"
                    >
                      <span className="h-4 w-4 rounded border border-[var(--color-silver-pine)] bg-[var(--color-arctic-mist)]" />
                      {keyword}
                    </label>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {activeTab === "tone" && (
            <FadeIn>
              <div className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
                <h2 className="font-aeonik text-2xl tracking-[-0.02em]">Tone Library</h2>
                <div className="mt-6 overflow-x-auto rounded-2xl border border-[rgba(83,88,98,0.16)]">
                  <table className="min-w-[500px] w-full text-left text-sm font-medium text-[var(--color-silver-pine)]">
                    <tbody>
                      {toneRows.map(([tone, description]) => (
                        <tr key={tone} className="border-t border-[rgba(83,88,98,0.12)] first:border-t-0">
                          <td className="w-48 bg-[var(--color-arctic-mist)] p-3 font-semibold text-[var(--color-obsidian)]">
                            {tone}
                          </td>
                          <td className="p-3">{description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </section>
    </div>
  );
}
