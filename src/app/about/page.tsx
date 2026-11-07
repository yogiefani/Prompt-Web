import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, Users, Zap, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami - PromptVault OS",
  description:
    "Pelajari lebih lanjut tentang PromptVault OS, platform prompt manager premium #1 di Indonesia untuk GPT, Claude, Gemini, dan AI lainnya.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--color-sky-wash)] text-[var(--color-obsidian)]">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-silver-pine)] hover:text-[var(--color-electric-blue)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <h1 className="font-aeonik text-4xl font-bold tracking-[-0.02em] mb-6">
          Tentang PromptVault OS
        </h1>

        <div className="prose-custom space-y-8">
          <section>
            <p className="text-lg text-[var(--color-silver-pine)] leading-relaxed">
              PromptVault OS adalah platform prompt manager premium yang
              dirancang untuk membantu kreator, profesional, dan tim di Indonesia
              mengelola, menyimpan, dan menemukan prompt terbaik mereka untuk
              berbagai model AI — mulai dari GPT, Claude, Gemini, hingga AI
              untuk gambar, video, dan agent workflow.
            </p>
          </section>

          <section>
            <h2>Misi Kami</h2>
            <p>
              Kami percaya bahwa AI dapat meningkatkan produktivitas setiap
              orang, namun tanpa prompt yang tepat, potensi AI tidak akan
              maksimal. Misi kami adalah membuat pengelolaan prompt menjadi
              mudah, terorganisir, dan dapat diakses oleh semua orang.
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[rgba(83,88,98,0.12)] bg-white p-6 dark:bg-[var(--color-canvas-white)] dark:border-white/10">
              <Sparkles className="mb-3 h-8 w-8 text-[var(--color-electric-blue)]" />
              <h3 className="font-aeonik text-lg font-bold mb-2">
                Prompt Premium
              </h3>
              <p className="text-sm text-[var(--color-silver-pine)]">
                Koleksi prompt yang dikurasi oleh para ahli untuk berbagai
                kebutuhan AI.
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(83,88,98,0.12)] bg-white p-6 dark:bg-[var(--color-canvas-white)] dark:border-white/10">
              <Users className="mb-3 h-8 w-8 text-[var(--color-deep-violet)]" />
              <h3 className="font-aeonik text-lg font-bold mb-2">
                Komunitas Aktif
              </h3>
              <p className="text-sm text-[var(--color-silver-pine)]">
                Bergabung dengan ribuan kreator dan profesional yang
                menggunakan AI setiap hari.
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(83,88,98,0.12)] bg-white p-6 dark:bg-[var(--color-canvas-white)] dark:border-white/10">
              <Zap className="mb-3 h-8 w-8 text-[var(--color-sunburst-yellow)]" />
              <h3 className="font-aeonik text-lg font-bold mb-2">
                Akses Cepat
              </h3>
              <p className="text-sm text-[var(--color-silver-pine)]">
                Temukan dan salin prompt yang Anda butuhkan dalam hitungan
                detik.
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(83,88,98,0.12)] bg-white p-6 dark:bg-[var(--color-canvas-white)] dark:border-white/10">
              <Shield className="mb-3 h-8 w-8 text-[var(--color-zesty-orange)]" />
              <h3 className="font-aeonik text-lg font-bold mb-2">
                Aman & Privat
              </h3>
              <p className="text-sm text-[var(--color-silver-pine)]">
                Data dan prompt Anda tersimpan dengan aman menggunakan
                infrastruktur cloud terpercaya.
              </p>
            </div>
          </div>

          <section>
            <h2>Tim Kami</h2>
            <p>
              PromptVault OS dibangun oleh tim yang berpengalaman di bidang
              teknologi AI dan pengembangan web di Indonesia. Kami berkomitmen
              untuk terus mengembangkan fitur-fitur terbaik bagi pengguna kami.
            </p>
          </section>

          <section>
            <h2>Hubungi Kami</h2>
            <p>
              Punya pertanyaan atau saran? Kami senang mendengar dari Anda.
              Kunjungi halaman{" "}
              <Link
                href="/contact"
                className="text-[var(--color-electric-blue)] hover:underline"
              >
                Kontak
              </Link>{" "}
              untuk menghubungi tim kami.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
