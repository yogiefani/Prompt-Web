import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSiteSettingsData } from "@/lib/prompt-data";
import { getBlogPosts } from "@/lib/blog-data";

import { LandingHeader } from "@/components/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingGallery } from "@/components/landing-gallery";
import { BentoFeatures } from "@/components/landing/bento-features";
import { TestimonialMarquee } from "@/components/landing/testimonial-marquee";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { BlogList } from "@/components/blog-list";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getSiteSettingsData();
  const posts = await getBlogPosts();
  const publishedPosts = posts.filter((p) => p.status === "published");

  return (
    <main className="min-h-screen bg-[var(--color-sky-wash)] text-[var(--color-obsidian)] selection:bg-[var(--color-electric-blue)] selection:text-white">
      <LandingHeader productUrl={settings.productUrl} />

      {/* Hero Section */}
      <HeroSection settings={settings} />

      {/* Landing Gallery */}
      <LandingGallery />

      {/* Bento Grid Features */}
      <BentoFeatures />

      {/* Testimonials */}
      <TestimonialMarquee />

      {/* Latest Tutorials */}
      <section className="bg-white py-24 sm:py-32" id="tutorials">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-aeonik text-3xl font-bold tracking-[-0.02em] text-[var(--color-obsidian)] sm:text-4xl">
              Tutorial & Panduan Terbaru
            </h2>
            <p className="mt-4 text-lg font-medium text-[var(--color-silver-pine)]">
              Pelajari trik prompting dari para ahli. Coba langsung prompt-nya ke dalam workflow Anda.
            </p>
          </div>
          <BlogList posts={publishedPosts} maxItems={3} />
          <div className="mt-12 flex justify-center">
            <Link
              href="/tutorials"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(83,88,98,0.16)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-obsidian)] transition-all hover:bg-[var(--color-arctic-mist)]"
            >
              Lihat Semua Tutorial
            </Link>
          </div>
        </div>
      </section>

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
