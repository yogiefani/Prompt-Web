import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer & Terms of Service - PromptVault OS",
  description:
    "Disclaimer dan syarat layanan penggunaan PromptVault OS. Baca sebelum menggunakan layanan kami.",
};

export default function DisclaimerPage() {
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

        <h1 className="font-aeonik text-4xl font-bold tracking-[-0.02em] mb-2">
          Disclaimer & Terms of Service
        </h1>
        <p className="text-[var(--color-silver-pine)] mb-12">
          Terakhir diperbarui: November 2026
        </p>

        <div className="prose-custom space-y-8">
          <section>
            <h2>1. Disclaimer</h2>
            <p>
              Seluruh informasi di situs PromptVault OS disediakan &ldquo;sebagaimana
              adanya&rdquo; tanpa jaminan apapun. Kami berusaha menjaga keakuratan
              informasi, namun tidak bertanggung jawab atas kesalahan atau
              kelalaian dalam konten.
            </p>
            <p>
              Prompt yang tersedia di platform ini adalah alat bantu dan
              referensi. Hasil yang diperoleh dari penggunaan prompt dapat
              bervariasi tergantung model AI yang digunakan, versi, dan konteks
              penggunaannya.
            </p>
          </section>

          <section>
            <h2>2. Syarat Penggunaan</h2>
            <p>
              Dengan mengakses dan menggunakan PromptVault OS, Anda menyetujui
              syarat-syarat berikut:
            </p>
            <ul>
              <li>
                Anda bertanggung jawab penuh atas penggunaan prompt dan konten
                yang dihasilkan dari AI.
              </li>
              <li>
                Dilarang menggunakan layanan kami untuk tujuan yang melanggar
                hukum atau merugikan pihak lain.
              </li>
              <li>
                Dilarang mendistribusikan ulang konten premium tanpa izin
                tertulis.
              </li>
              <li>
                Kami berhak menangguhkan atau menghentikan akses pengguna yang
                melanggar ketentuan ini.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Hak Kekayaan Intelektual</h2>
            <p>
              Seluruh konten di PromptVault OS, termasuk teks, desain, logo, dan
              prompt, dilindungi oleh hak cipta. Pengguna mendapatkan lisensi
              penggunaan sesuai dengan paket yang dibeli, namun hak kepemilikan
              tetap berada pada PromptVault OS.
            </p>
          </section>

          <section>
            <h2>4. Iklan dan Konten Pihak Ketiga</h2>
            <p>
              Situs ini menampilkan iklan dari Google AdSense dan mungkin
              menyertakan tautan ke situs pihak ketiga. Kami tidak bertanggung
              jawab atas konten, kebijakan privasi, atau praktik situs pihak
              ketiga tersebut. Kami menyarankan Anda untuk membaca kebijakan
              privasi setiap situs yang Anda kunjungi.
            </p>
          </section>

          <section>
            <h2>5. Batasan Tanggung Jawab</h2>
            <p>
              Dalam hal apapun, PromptVault OS tidak bertanggung jawab atas
              kerugian langsung, tidak langsung, insidental, atau konsekuensial
              yang timbul dari penggunaan atau ketidakmampuan menggunakan
              layanan kami.
            </p>
          </section>

          <section>
            <h2>6. Pengembalian Dana</h2>
            <p>
              Kebijakan pengembalian dana diatur sesuai dengan ketentuan
              platform pembayaran yang digunakan. Silakan hubungi tim kami
              melalui halaman{" "}
              <Link
                href="/contact"
                className="text-[var(--color-electric-blue)] hover:underline"
              >
                Kontak
              </Link>{" "}
              untuk pertanyaan terkait pengembalian dana.
            </p>
          </section>

          <section>
            <h2>7. Perubahan Ketentuan</h2>
            <p>
              Kami berhak mengubah syarat dan ketentuan ini kapan saja.
              Perubahan akan berlaku setelah diposting di halaman ini. Dengan
              terus menggunakan layanan kami setelah perubahan, Anda dianggap
              menyetujui ketentuan yang telah diperbarui.
            </p>
          </section>

          <section>
            <h2>8. Hubungi Kami</h2>
            <p>
              Untuk pertanyaan mengenai disclaimer dan syarat layanan ini,
              silakan hubungi kami melalui halaman{" "}
              <Link
                href="/contact"
                className="text-[var(--color-electric-blue)] hover:underline"
              >
                Kontak
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
