import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { getSiteSettingsData } from "@/lib/prompt-data";

import { HeroSection } from "@/components/landing/hero-section";
import { BentoFeatures } from "@/components/landing/bento-features";
import { TestimonialMarquee } from "@/components/landing/testimonial-marquee";
import { FaqAccordion } from "@/components/landing/faq-accordion";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getSiteSettingsData();

  return (
    <main className="min-h-screen bg-[var(--color-sky-wash)] text-[var(--color-obsidian)] selection:bg-[var(--color-electric-blue)] selection:text-white">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[rgba(235,245,255,0.82)] backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <BrandMark />
          <div className="hidden items-center gap-8 text-sm font-bold text-[var(--color-silver-pine)] md:flex">
            <a href="#features" className="hover:text-[var(--color-electric-blue)] transition-colors">Fitur</a>
            <a href="#faq" className="hover:text-[var(--color-electric-blue)] transition-colors">FAQ</a>
            <Link href="/library/tutorials" className="hover:text-[var(--color-electric-blue)] transition-colors">Tutorials</Link>
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

      {/* Hero Section */}
      <HeroSection settings={settings} />

      {/* Bento Grid Features */}
      <BentoFeatures />

      {/* Testimonials */}
      <TestimonialMarquee />

      {/* FAQ */}
      <FaqAccordion />

      {/* Final CTA */}
      <section className="bg-[var(--color-midnight-ink)] py-24 sm:py-32 text-center text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-aeonik text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
            Siap Merevolusi Cara Kerja Anda?
          </h2>
          <p className="mt-6 text-lg font-medium leading-8 text-[rgba(255,255,255,0.8)]">
            Bergabunglah dengan ribuan kreator dan profesional yang telah menghemat ratusan jam kerja menggunakan PromptVault OS.
          </p>
          <div className="mt-10 flex justify-center">
            <a href={settings.productUrl} className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 py-4 text-base font-bold text-[var(--color-midnight-ink)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              <span className="relative z-10 flex items-center gap-2">
                Dapatkan Akses Sekarang
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </div>
        </div>
      </section>
      
      <footer className="border-t border-[rgba(83,88,98,0.1)] bg-white py-8 text-center text-sm font-medium text-[var(--color-silver-pine)]">
        &copy; {new Date().getFullYear()} {settings.brandName}. All rights reserved.
      </footer>
    </main>
  );
}
