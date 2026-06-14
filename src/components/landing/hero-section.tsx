import Link from "next/link";
import { ArrowRight, Sparkles, Star, Copy } from "lucide-react";
import { FadeIn, ScaleIn, LiftCard } from "@/components/motion-primitives";
import { promptCategories, prompts } from "@/lib/content";

export function HeroSection({ settings }: { settings: any }) {
  const featuredPrompts = prompts.slice(0, 6);

  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-8">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-whisper-fade-blue)] opacity-50 blur-[100px]" />
      
      <FadeIn className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--color-silver-pine)] shadow-[var(--shadow-lg)] backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-[var(--color-sunburst-yellow)]" aria-hidden="true" />
          Prompt manager premium #1 di Indonesia
        </div>
        
        <h1 className="font-aeonik text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-[var(--color-obsidian)] sm:text-6xl lg:text-[4.5rem]">
          Stop Kehilangan <br className="hidden lg:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-electric-blue)] to-[var(--color-midnight-ink)]">Prompt Terbaik</span> Anda.
        </h1>
        
        <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed tracking-[-0.01em] text-[var(--color-silver-pine)] sm:text-xl">
          Simpan, kelola, dan temukan prompt terbaik Anda dalam 1 detik. Dapatkan akses eksklusif ke seluruh pustaka prompt premium kami sekarang!
        </p>
        
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
          <a href={settings.productUrl} className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[var(--color-midnight-ink)] px-8 py-4 text-base font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(33,43,54,0.4)]">
            <span className="relative z-10 flex items-center gap-2">
              Beli Akses Sekarang
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
          <Link href="/library" className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(83,88,98,0.16)] bg-white px-8 py-4 text-base font-bold text-[var(--color-obsidian)] transition-all hover:bg-[var(--color-arctic-mist)]">
            Lihat Demo
          </Link>
        </div>

        {/* Social Proof */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:items-start">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User avatar" className="h-10 w-10 rounded-full border-2 border-white object-cover" />
            ))}
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex gap-1 text-[var(--color-sunburst-yellow)]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-sm font-semibold text-[var(--color-silver-pine)]">
              Dipercaya oleh <span className="text-[var(--color-obsidian)]">5,000+</span> Creators
            </p>
          </div>
        </div>
      </FadeIn>

      <ScaleIn id="library" className="relative w-full min-w-0" delay={0.12}>
        <div className="w-full min-w-0" style={{ perspective: "1000px" }}>
          <div className="hero-rotate-card w-full min-w-0 rounded-[32px] bg-white p-3 shadow-2xl transition-transform duration-700 hover:rotate-x-0 hover:rotate-y-0">
            <div className="w-full min-w-0 rounded-[28px] border border-[rgba(83,88,98,0.12)] bg-[var(--color-arctic-mist)] p-4 shadow-inner overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-[rgba(83,88,98,0.12)] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-silver-pine)]">Member Library</p>
                <h2 className="font-aeonik text-2xl font-bold tracking-[-0.02em] text-[var(--color-obsidian)] sm:text-3xl">
                  Prompt Command Center
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden rounded-full bg-white px-4 py-2 text-xs font-bold text-[var(--color-silver-pine)] sm:block">
                  128 prompts
                </span>
                <span className="rounded-full bg-[var(--color-electric-blue)] px-4 py-2 text-xs font-bold text-white shadow-md">
                  Pro Access
                </span>
              </div>
            </div>

            <div className="no-scrollbar mt-4 flex w-full max-w-full gap-2 overflow-x-auto pb-2">
              {promptCategories.slice(0, 4).map((category) => (
                <span key={category.slug} className="flex shrink-0 items-center gap-2 rounded-full border border-[rgba(83,88,98,0.08)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-silver-pine)] shadow-sm">
                  <category.icon className="h-4 w-4 text-[var(--color-electric-blue)]" aria-hidden="true" />
                  {category.name}
                </span>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {featuredPrompts.slice(0, 4).map((prompt) => (
                <LiftCard key={prompt.title} className="rounded-3xl border border-[rgba(83,88,98,0.12)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]">
                      <Sparkles className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-sky-wash)] text-[var(--color-ash-gray)] transition-colors hover:bg-[var(--color-midnight-ink)] hover:text-white">
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <h3 className="line-clamp-1 font-aeonik text-lg font-bold tracking-[-0.02em]">{prompt.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm font-medium leading-relaxed text-[var(--color-silver-pine)]">
                    {prompt.body}
                  </p>
                </LiftCard>
              ))}
            </div>
          </div>
        </div>
        </div>
      </ScaleIn>
    </section>
  );
}
