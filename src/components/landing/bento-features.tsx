import { Code2, LayoutTemplate, LockKeyhole, Search } from "lucide-react";
import { Stagger, LiftCard } from "@/components/motion-primitives";

export function BentoFeatures() {
  return (
    <section className="bg-white py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-aeonik text-base font-bold uppercase tracking-widest text-[var(--color-electric-blue)]">
            Mengapa PromptVault OS?
          </h2>
          <p className="mt-4 font-aeonik text-4xl font-bold tracking-[-0.02em] text-[var(--color-obsidian)] sm:text-5xl">
            Sistem Cerdas untuk Menguasai Workflow AI Anda
          </p>
          <p className="mt-6 text-lg font-medium leading-8 text-[var(--color-silver-pine)]">
            Bukan sekadar tempat menyimpan teks. PromptVault OS adalah CMS pintar dengan fitur variabel dinamis dan manajemen akses.
          </p>
        </div>

        <Stagger className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1: Dynamic Variables (Span 2) */}
          <LiftCard className="feature-card group relative overflow-hidden sm:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-sky-wash)] to-white opacity-50" />
            <div className="relative z-10 flex h-full flex-col">
              <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)] shadow-sm">
                <Code2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-aeonik text-2xl font-bold tracking-[-0.02em] text-[var(--color-obsidian)]">
                Variabel Dinamis Otomatis
              </h3>
              <p className="mt-3 max-w-md text-base font-medium leading-relaxed text-[var(--color-silver-pine)]">
                Tidak perlu pusing mencari &quot;[MASUKKAN TOPIK DI SINI]&quot; dalam teks panjang. Sistem akan otomatis mendeteksi variabel kurung siku dan membuatkan form input rapi.
              </p>
              <div className="mt-8 flex-1 rounded-2xl border border-[rgba(83,88,98,0.12)] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-[var(--color-silver-pine)]">Topik Tulisan</label>
                    <input readOnly value="Cara Belajar React" className="form-input text-sm" />
                  </div>
                  <div className="rounded-xl bg-[var(--color-sky-wash)] p-4 text-sm font-medium leading-relaxed text-[var(--color-obsidian)]">
                    Tuliskan artikel blog 500 kata tentang <span className="rounded-md bg-blue-100 px-1 font-bold text-blue-700">Cara Belajar React</span> dengan gaya bahasa santai...
                  </div>
                </div>
              </div>
            </div>
          </LiftCard>

          {/* Feature 2: WYSIWYG CMS */}
          <LiftCard className="feature-card relative overflow-hidden">
            <div className="relative z-10 flex h-full flex-col">
              <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-yellow)] text-[var(--color-sunburst-yellow)] shadow-sm">
                <LayoutTemplate className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-aeonik text-2xl font-bold tracking-[-0.02em] text-[var(--color-obsidian)]">
                Blog & Tutorial CMS
              </h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-[var(--color-silver-pine)]">
                Edukasi member Anda. Dilengkapi dengan Editor Medium-style, mendukung upload gambar langsung dari komputer Anda.
              </p>
            </div>
          </LiftCard>

          {/* Feature 3: Roles */}
          <LiftCard className="feature-card relative overflow-hidden">
            <div className="relative z-10 flex h-full flex-col">
              <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shadow-sm">
                <LockKeyhole className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-aeonik text-2xl font-bold tracking-[-0.02em] text-[var(--color-obsidian)]">
                Akses Eksklusif & Terproteksi
              </h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-[var(--color-silver-pine)]">
                Setiap member mendapatkan akun pribadi yang aman. Akses instan diberikan otomatis setelah pembelian terverifikasi.
              </p>
            </div>
          </LiftCard>

          {/* Feature 4: Search & Filter (Span 2) */}
          <LiftCard className="feature-card relative overflow-hidden sm:col-span-2">
             <div className="relative z-10 flex h-full flex-col">
              <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
                <Search className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-aeonik text-2xl font-bold tracking-[-0.02em] text-[var(--color-obsidian)]">
                Pencarian Kilat & Filter Tag
              </h3>
              <p className="mt-3 max-w-xl text-base font-medium leading-relaxed text-[var(--color-silver-pine)]">
                Member dapat mencari prompt spesifik, memfilter berdasarkan kategori, memilih target AI Model yang optimal, dan menyimpan prompt ke daftar Favorit mereka sendiri.
              </p>
              <div className="mt-8 flex gap-3">
                <span className="rounded-full bg-[var(--color-midnight-ink)] px-5 py-2.5 text-sm font-bold text-white shadow-md">Marketing</span>
                <span className="rounded-full border border-[rgba(83,88,98,0.2)] bg-white px-5 py-2.5 text-sm font-bold text-[var(--color-silver-pine)]">SEO</span>
                <span className="hidden rounded-full border border-[rgba(83,88,98,0.2)] bg-white px-5 py-2.5 text-sm font-bold text-[var(--color-silver-pine)] sm:inline-flex">Copywriting</span>
              </div>
            </div>
          </LiftCard>
        </Stagger>
      </div>
    </section>
  );
}
