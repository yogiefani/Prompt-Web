import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  FileText,
  FolderKanban,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { AccessManager } from "@/components/access-manager";
import { LogoutButton } from "@/components/logout-button";
import { FadeIn, LiftCard, ScaleIn, Stagger } from "@/components/motion-primitives";
import { PromptAnalyticsPanel } from "@/components/prompt-analytics-panel";
import { PromptCmsManager } from "@/components/prompt-cms-manager";
import { RequestInbox } from "@/components/request-inbox";
import { SuperadminConsole } from "@/components/superadmin-console";
import { featurePhases } from "@/lib/content";
import { getPromptWorkspaceData, type IconName } from "@/lib/prompt-data";

export const dynamic = "force-dynamic";

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

export default async function SuperadminPage() {
  const workspace = await getPromptWorkspaceData();

  return (
    <main className="min-h-screen bg-[var(--color-sky-wash)] text-[var(--color-obsidian)]">
      <header className="border-b border-white/80 bg-white/70 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Link href="/" className="secondary-button">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Home
            </Link>
            <LogoutButton className="secondary-button hidden sm:inline-flex" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <FadeIn className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-whisper-fade-violet)] px-4 py-2 text-xs font-semibold text-[var(--color-deep-violet)]">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Superadmin Console
              </span>
              <span className="ml-2 inline-flex rounded-full bg-[var(--color-sky-wash)] px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)]">
                {workspace.source === "supabase" ? "Supabase Data" : "Fallback Data"}
              </span>
              <h1 className="mt-5 max-w-3xl font-aeonik text-5xl leading-tight tracking-[-0.02em]">
                Kelola prompt manager sebagai produk digital.
              </h1>
              <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-[var(--color-silver-pine)]">
                Console ini menjadi pusat untuk mengatur link pembelian, katalog prompt,
                kategori multi-AI, user access, dan tahapan pengembangan fitur.
              </p>
            </div>
            <button className="primary-button" type="button">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Prompt
            </button>
          </div>
        </FadeIn>

        <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workspace.stats.map((stat) => {
            const Icon = iconMap[stat.iconName];

            return (
              <LiftCard key={stat.label} className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-5 text-sm font-semibold text-[var(--color-silver-pine)]">{stat.label}</p>
                <p className="mt-2 font-aeonik text-4xl tracking-[-0.02em]">{stat.value}</p>
              </LiftCard>
            );
          })}
        </Stagger>

        <PromptAnalyticsPanel insights={workspace.insights} />

        <ScaleIn>
          <SuperadminConsole
            initialBrandName={workspace.settings.brandName}
            initialProductUrl={workspace.settings.productUrl}
            initialSupportEmail={workspace.settings.supportEmail}
            source={workspace.source}
          />
        </ScaleIn>

        <AccessManager source={workspace.source} />

        <RequestInbox initialRequests={workspace.requests} source={workspace.source} />

        <PromptCmsManager
          initialCategories={workspace.categories}
          initialPrompts={workspace.prompts}
          source={workspace.source}
        />

        <FadeIn className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
          <h2 className="font-aeonik text-2xl tracking-[-0.02em]">Tahapan Fitur</h2>
          <Stagger className="mt-6 grid gap-4 lg:grid-cols-5">
            {featurePhases.map((phase) => (
              <LiftCard key={phase.title} className="rounded-3xl bg-[var(--color-arctic-mist)] p-5">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-electric-blue)]">
                  {phase.status}
                </span>
                <h3 className="mt-4 font-aeonik text-lg leading-tight tracking-[-0.02em]">
                  {phase.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
                  {phase.description}
                </p>
              </LiftCard>
            ))}
          </Stagger>
        </FadeIn>
      </div>
    </main>
  );
}
