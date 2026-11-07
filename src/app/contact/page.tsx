import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Hubungi Kami - PromptVault OS",
  description:
    "Hubungi tim PromptVault OS untuk pertanyaan, saran, atau dukungan. Kami siap membantu Anda.",
};

export default function ContactPage() {
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

        <h1 className="font-aeonik text-4xl font-bold tracking-[-0.02em] mb-4">
          Hubungi Kami
        </h1>
        <p className="text-lg text-[var(--color-silver-pine)] mb-12">
          Punya pertanyaan, saran, atau butuh bantuan? Tim kami siap membantu
          Anda.
        </p>

        <div className="grid gap-6 sm:grid-cols-3 mb-12">
          <div className="rounded-2xl border border-[rgba(83,88,98,0.12)] bg-white p-6 text-center dark:bg-[var(--color-canvas-white)] dark:border-white/10">
            <Mail className="mx-auto mb-3 h-8 w-8 text-[var(--color-electric-blue)]" />
            <h3 className="font-aeonik text-base font-bold mb-1">Email</h3>
            <p className="text-sm text-[var(--color-silver-pine)]">
              support@promptvault.codes
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(83,88,98,0.12)] bg-white p-6 text-center dark:bg-[var(--color-canvas-white)] dark:border-white/10">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-[var(--color-deep-violet)]" />
            <h3 className="font-aeonik text-base font-bold mb-1">
              Sosial Media
            </h3>
            <p className="text-sm text-[var(--color-silver-pine)]">
              @promptvaultos
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(83,88,98,0.12)] bg-white p-6 text-center dark:bg-[var(--color-canvas-white)] dark:border-white/10">
            <MapPin className="mx-auto mb-3 h-8 w-8 text-[var(--color-zesty-orange)]" />
            <h3 className="font-aeonik text-base font-bold mb-1">Lokasi</h3>
            <p className="text-sm text-[var(--color-silver-pine)]">
              Indonesia
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(83,88,98,0.12)] bg-white p-8 dark:bg-[var(--color-canvas-white)] dark:border-white/10">
          <h2 className="font-aeonik text-2xl font-bold tracking-[-0.02em] mb-6">
            Kirim Pesan
          </h2>
          <form className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-semibold text-[var(--color-obsidian)]"
              >
                Nama
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full rounded-xl border border-[rgba(83,88,98,0.16)] bg-[var(--color-sky-wash)] px-4 py-3 text-sm font-medium text-[var(--color-obsidian)] outline-none transition-all focus:border-[var(--color-electric-blue)] focus:ring-2 focus:ring-[var(--color-electric-blue)]/20 dark:bg-[var(--color-midnight-ink)] dark:border-white/10"
                placeholder="Nama lengkap Anda"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-[var(--color-obsidian)]"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full rounded-xl border border-[rgba(83,88,98,0.16)] bg-[var(--color-sky-wash)] px-4 py-3 text-sm font-medium text-[var(--color-obsidian)] outline-none transition-all focus:border-[var(--color-electric-blue)] focus:ring-2 focus:ring-[var(--color-electric-blue)]/20 dark:bg-[var(--color-midnight-ink)] dark:border-white/10"
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="mb-1.5 block text-sm font-semibold text-[var(--color-obsidian)]"
              >
                Subjek
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="w-full rounded-xl border border-[rgba(83,88,98,0.16)] bg-[var(--color-sky-wash)] px-4 py-3 text-sm font-medium text-[var(--color-obsidian)] outline-none transition-all focus:border-[var(--color-electric-blue)] focus:ring-2 focus:ring-[var(--color-electric-blue)]/20 dark:bg-[var(--color-midnight-ink)] dark:border-white/10"
                placeholder="Topik pesan Anda"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-1.5 block text-sm font-semibold text-[var(--color-obsidian)]"
              >
                Pesan
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full rounded-xl border border-[rgba(83,88,98,0.16)] bg-[var(--color-sky-wash)] px-4 py-3 text-sm font-medium text-[var(--color-obsidian)] outline-none transition-all focus:border-[var(--color-electric-blue)] focus:ring-2 focus:ring-[var(--color-electric-blue)]/20 dark:bg-[var(--color-midnight-ink)] dark:border-white/10 resize-none"
                placeholder="Tulis pesan Anda di sini..."
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--color-midnight-ink)] px-6 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg dark:bg-[var(--color-electric-blue)]"
            >
              Kirim Pesan
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
