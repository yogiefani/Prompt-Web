import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Copy,
  Database,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { FadeIn, LiftCard, ScaleIn, Stagger } from "@/components/motion-primitives";
import { featurePhases, promptCategories, prompts } from "@/lib/content";
import { getSiteSettingsData } from "@/lib/prompt-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredPrompts = prompts.slice(0, 6);
  const settings = await getSiteSettingsData();

  return (
    <main className="min-h-screen bg-[var(--color-sky-wash)] text-[var(--color-obsidian)]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[rgba(235,245,255,0.82)] backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <BrandMark />
          <div className="hidden items-center gap-8 text-sm font-semibold text-[var(--color-silver-pine)] md:flex">
            <a href="#library">Library</a>
            <a href="#roles">Role</a>
            <a href="#roadmap">Tahapan</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="secondary-button hidden sm:inline-flex">
              Login
            </Link>
            <a href={settings.productUrl} className="primary-button">
              Beli Access
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <FadeIn>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--color-silver-pine)] shadow-[var(--shadow-lg)]">
            <Sparkles className="h-4 w-4 text-[var(--color-sunburst-yellow)]" aria-hidden="true" />
            Prompt manager untuk GPT, Claude, Gemini, image AI, video AI, dan agent
          </div>
          <h1 className="font-aeonik text-5xl leading-[1.05] tracking-[-0.02em] text-[var(--color-obsidian)] sm:text-6xl lg:text-7xl">
            {settings.brandName}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 tracking-[-0.01em] text-[var(--color-silver-pine)]">
            Pusat penyimpanan, pengelolaan, dan distribusi prompt premium untuk semua workflow AI.
            Superadmin mengatur katalog dan akses, member langsung memakai prompt siap copy.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/library" className="primary-button">
              Lihat Library Demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/superadmin" className="secondary-button">
              Dashboard Superadmin
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              "Access user dari pembelian produk",
              "Product link bisa diatur admin",
              "Skema data terintegrasi",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[var(--color-silver-pine)]">
                <CheckCircle2 className="h-4 w-4 text-[var(--color-electric-blue)]" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </FadeIn>

        <ScaleIn id="library" className="rounded-[32px] bg-white p-3 shadow-[var(--shadow-lg)]" delay={0.12}>
          <div className="rounded-[28px] border border-[rgba(83,88,98,0.12)] bg-[var(--color-arctic-mist)] p-4">
            <div className="flex flex-col gap-4 border-b border-[rgba(83,88,98,0.12)] pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-silver-pine)]">Member Library</p>
                <h2 className="font-aeonik text-3xl tracking-[-0.02em] text-[var(--color-obsidian)]">
                  Prompt Command Center
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--color-silver-pine)]">
                  128 prompts
                </span>
                <span className="rounded-full bg-[var(--color-midnight-ink)] px-4 py-2 text-xs font-semibold text-white">
                  Pro Access
                </span>
              </div>
            </div>

            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
              {promptCategories.slice(0, 5).map((category) => (
                <span key={category.slug} className="category-pill bg-white">
                  <category.icon className="h-4 w-4" aria-hidden="true" />
                  {category.name}
                </span>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {featuredPrompts.map((prompt) => (
                <LiftCard key={prompt.title} className="rounded-3xl border border-[rgba(83,88,98,0.12)] bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-yellow)] text-[var(--color-sunburst-yellow)]">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <Copy className="h-4 w-4 text-[var(--color-ash-gray)]" aria-hidden="true" />
                  </div>
                  <h3 className="font-aeonik text-lg tracking-[-0.02em]">{prompt.title}</h3>
                  <p className="mt-3 line-clamp-4 text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
                    {prompt.body}
                  </p>
                </LiftCard>
              ))}
            </div>
          </div>
        </ScaleIn>
      </section>

      <section id="roles" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Stagger className="grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: LockKeyhole,
                title: "Superadmin",
                body: "Akun milik pengelola. Bisa mengatur product link, kategori, prompt, user access, dan analytics.",
              },
              {
                icon: Bot,
                title: "User Access",
                body: "Akun member dari pembelian produk digital. Fokus membaca, mencari, copy, dan menyimpan prompt favorit.",
              },
              {
                icon: Database,
                title: "Database Terintegrasi",
                body: "Menggunakan otentikasi aman, pembagian peran akses, perlindungan data, dan pengaturan situs mandiri.",
              },
            ].map((item) => (
              <LiftCard key={item.title} className="feature-card">
                <span className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]">
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="font-aeonik text-2xl tracking-[-0.02em] text-[var(--color-obsidian)]">
                  {item.title}
                </h2>
                <p className="mt-4 text-base font-medium leading-7 tracking-[-0.01em] text-[var(--color-silver-pine)]">
                  {item.body}
                </p>
              </LiftCard>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="roadmap" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-electric-blue)]">
              Feature Plan
            </p>
            <h2 className="mt-3 font-aeonik text-4xl tracking-[-0.02em] text-[var(--color-obsidian)]">
              Dipecah per tahapan agar gampang lanjut fitur demi fitur.
            </h2>
          </FadeIn>
          <Stagger className="grid gap-4 lg:grid-cols-5">
            {featurePhases.map((phase) => (
              <LiftCard key={phase.title} className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)]">
                <span className="rounded-full bg-[var(--color-sky-wash)] px-3 py-1 text-xs font-semibold text-[var(--color-electric-blue)]">
                  {phase.status}
                </span>
                <h3 className="mt-5 font-aeonik text-xl leading-tight tracking-[-0.02em]">
                  {phase.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
                  {phase.description}
                </p>
              </LiftCard>
            ))}
          </Stagger>
        </div>
      </section>
    </main>
  );
}
