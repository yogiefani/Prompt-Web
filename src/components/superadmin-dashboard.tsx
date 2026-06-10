"use client";

import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  Compass,
  FileText,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { LogoutButton } from "@/components/logout-button";
import { FadeIn, LiftCard, ScaleIn, Stagger } from "@/components/motion-primitives";
import { PromptAnalyticsPanel } from "@/components/prompt-analytics-panel";
import { SuperadminConsole } from "@/components/superadmin-console";
import { AccessManager } from "@/components/access-manager";
import { RequestInbox } from "@/components/request-inbox";
import { PromptCmsManager } from "@/components/prompt-cms-manager";
import { featurePhases } from "@/lib/content";
import type { PromptWorkspaceData, IconName } from "@/lib/prompt-data";

type SuperadminDashboardProps = {
  workspace: PromptWorkspaceData;
};

const iconMap: Record<IconName, typeof Sparkles> = {
  "bar-chart": BarChart3,
  book: BookOpen,
  file: FileText,
  folder: FolderKanban,
  sparkles: Sparkles,
  bot: Sparkles,
  compass: Sparkles,
  message: Sparkles,
  search: Sparkles,
  wand: Sparkles,
};

export function SuperadminDashboard({ workspace }: SuperadminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "cms" | "access" | "requests" | "settings" | "roadmap">(
    "overview"
  );

  const pendingRequestsCount = workspace.requests.filter(
    (request) => request.status === "pending" || request.status === "reviewing"
  ).length;

  type TabId = "overview" | "cms" | "access" | "requests" | "settings" | "roadmap";

  const sidebarMenu: { id: TabId; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: "overview", label: "Overview & Analitik", icon: LayoutDashboard },
    { id: "cms", label: "Prompt CMS", icon: FolderKanban },
    { id: "access", label: "Akses Member", icon: ShieldCheck },
    { id: "requests", label: "Permintaan Prompt", icon: Inbox, badge: pendingRequestsCount },
    { id: "settings", label: "Pengaturan Publik", icon: Settings },
    { id: "roadmap", label: "Roadmap Fitur", icon: Compass },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-[290px_1fr]">
      {/* Sidebar Kiri */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/80 bg-white/75 p-5 backdrop-blur-xl lg:flex">
        <Link href="/" className="mb-8 block">
          <BrandMark />
        </Link>

        <nav className="flex-1 space-y-1.5">
          {sidebarMenu.map((item) => {
            const Icon = item.icon;
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
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  {item.label}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`flex h-5.5 min-w-5.5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                      isActive ? "bg-[var(--color-electric-blue)] text-white" : "bg-[var(--color-whisper-fade-orange)] text-[var(--color-zesty-orange)]"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-5 border-t border-[rgba(83,88,98,0.12)]">
          <div className="flex flex-col gap-2">
            <Link href="/library" className="secondary-button w-full">
              Member Library
            </Link>
            <LogoutButton className="secondary-button w-full" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col">
        {/* Header mobile/tablet & desktop bar */}
        <header className="sticky top-0 z-30 border-b border-white/80 bg-[rgba(235,245,255,0.86)] px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-silver-pine)] uppercase tracking-[0.06em]">
                PromptVault OS
                <span className="mx-1 text-gray-300">/</span>
                Superadmin Dashboard
              </div>
              <h1 className="mt-1 font-aeonik text-3xl tracking-[-0.02em] md:text-4xl text-[var(--color-obsidian)]">
                {sidebarMenu.find((m) => m.id === activeTab)?.label}
              </h1>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <Link href="/library" className="secondary-button py-2 px-3 text-xs">
                Library
              </Link>
              <LogoutButton className="secondary-button py-2 px-3 text-xs" />
            </div>
          </div>

          {/* Navigasi Horisontal untuk Mobile & Tablet */}
          <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
            {sidebarMenu.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  type="button"
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-all border ${
                    isActive
                      ? "bg-[var(--color-midnight-ink)] text-white border-transparent"
                      : "bg-white text-[var(--color-silver-pine)] border-[rgba(83,88,98,0.12)]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                  {item.badge && item.badge > 0 ? (
                    <span className="rounded-full bg-[var(--color-whisper-fade-orange)] px-1.5 py-0.5 text-[9px] font-black text-[var(--color-zesty-orange)]">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full">
          {activeTab === "overview" && (
            <FadeIn className="space-y-8">
              {/* Stats Grid */}
              <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {workspace.stats.map((stat) => {
                  const Icon = iconMap[stat.iconName] || FileText;

                  return (
                    <LiftCard key={stat.label} className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] border border-white/50">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <p className="mt-5 text-sm font-semibold text-[var(--color-silver-pine)]">{stat.label}</p>
                      <p className="mt-2 font-aeonik text-4xl tracking-[-0.02em] text-[var(--color-obsidian)]">{stat.value}</p>
                    </LiftCard>
                  );
                })}
              </Stagger>

              {/* Analytics Panel */}
              <PromptAnalyticsPanel insights={workspace.insights} />
            </FadeIn>
          )}

          {activeTab === "cms" && (
            <ScaleIn id="prompt-cms-section" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-aeonik text-2xl tracking-[-0.02em] text-[var(--color-obsidian)]">Kelola Katalog Prompt</h2>
                  <p className="mt-1 text-sm font-medium text-[var(--color-silver-pine)]">Tambah, ubah, dan hapus kategori atau item prompt.</p>
                </div>
              </div>
              <PromptCmsManager
                initialCategories={workspace.categories}
                initialPrompts={workspace.prompts}
                source={workspace.source}
              />
            </ScaleIn>
          )}

          {activeTab === "access" && (
            <ScaleIn className="space-y-6">
              <div>
                <h2 className="font-aeonik text-2xl tracking-[-0.02em] text-[var(--color-obsidian)]">Kelola Akses Member</h2>
                <p className="mt-1 text-sm font-medium text-[var(--color-silver-pine)]">Berikan hak akses premium kepada pembeli produk.</p>
              </div>
              <AccessManager source={workspace.source} initialGrants={workspace.grants} />
            </ScaleIn>
          )}

          {activeTab === "requests" && (
            <ScaleIn className="space-y-6">
              <div>
                <h2 className="font-aeonik text-2xl tracking-[-0.02em] text-[var(--color-obsidian)]">Review Permintaan Member</h2>
                <p className="mt-1 text-sm font-medium text-[var(--color-silver-pine)]">Lihat request dari member untuk rilis prompt baru.</p>
              </div>
              <RequestInbox initialRequests={workspace.requests} source={workspace.source} />
            </ScaleIn>
          )}

          {activeTab === "settings" && (
            <ScaleIn className="space-y-8">
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <SuperadminConsole
                  initialBrandName={workspace.settings.brandName}
                  initialProductUrl={workspace.settings.productUrl}
                  initialSupportEmail={workspace.settings.supportEmail}
                  source={workspace.source}
                />
              </div>
            </ScaleIn>
          )}

          {activeTab === "roadmap" && (
            <FadeIn className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8 border border-white/50">
              <h2 className="font-aeonik text-2xl tracking-[-0.02em] text-[var(--color-obsidian)]">Tahapan Fitur</h2>
              <p className="mt-2 text-sm font-medium text-[var(--color-silver-pine)]">Rencana rilis dan peta jalan produk digital.</p>
              
              <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {featurePhases.map((phase) => (
                  <LiftCard key={phase.title} className="rounded-3xl bg-[var(--color-arctic-mist)] p-5 border border-gray-100">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-electric-blue)] shadow-sm">
                      {phase.status}
                    </span>
                    <h3 className="mt-4 font-aeonik text-lg leading-tight tracking-[-0.02em] text-[var(--color-obsidian)]">
                      {phase.title}
                    </h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
                      {phase.description}
                    </p>
                  </LiftCard>
                ))}
              </Stagger>
            </FadeIn>
          )}
        </main>
      </div>
    </div>
  );
}
