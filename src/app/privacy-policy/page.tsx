import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - PromptVault OS",
  description:
    "Kebijakan privasi PromptVault OS. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-[var(--color-silver-pine)] mb-12">
          Terakhir diperbarui: November 2026
        </p>

        <div className="prose-custom space-y-8">
          <section>
            <h2>1. Informasi yang Kami Kumpulkan</h2>
            <p>
              Saat Anda menggunakan PromptVault OS, kami dapat mengumpulkan
              informasi berikut:
            </p>
            <ul>
              <li>
                <strong>Informasi Akun:</strong> Nama, alamat email, dan
                informasi profil yang Anda berikan saat mendaftar.
              </li>
              <li>
                <strong>Data Penggunaan:</strong> Informasi tentang bagaimana
                Anda menggunakan layanan kami, termasuk halaman yang dikunjungi,
                waktu akses, dan interaksi dengan fitur.
              </li>
              <li>
                <strong>Data Teknis:</strong> Alamat IP, jenis browser, sistem
                operasi, dan informasi perangkat.
              </li>
              <li>
                <strong>Cookies:</strong> Kami menggunakan cookies dan teknologi
                serupa untuk meningkatkan pengalaman pengguna.
              </li>
            </ul>
          </section>

          <section>
            <h2>2. Penggunaan Informasi</h2>
            <p>Informasi yang kami kumpulkan digunakan untuk:</p>
            <ul>
              <li>Menyediakan dan memelihara layanan kami</li>
              <li>Meningkatkan dan mengembangkan fitur baru</li>
              <li>Mengirim pembaruan dan informasi terkait layanan</li>
              <li>Mendeteksi dan mencegah aktivitas yang tidak sah</li>
              <li>Memenuhi kewajiban hukum yang berlaku</li>
            </ul>
          </section>

          <section>
            <h2>3. Iklan Pihak Ketiga</h2>
            <p>
              Kami menggunakan Google AdSense untuk menampilkan iklan di situs
              ini. Google AdSense menggunakan cookies untuk menampilkan iklan
              berdasarkan kunjungan Anda ke situs ini dan situs lainnya.
              Penggunaan cookies iklan oleh Google memungkinkan Google dan
              mitranya menyajikan iklan berdasarkan kunjungan Anda. Anda dapat
              menolak penggunaan cookies personalisasi dengan mengunjungi{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-electric-blue)] hover:underline"
              >
                Pengaturan Iklan Google
              </a>
              .
            </p>
          </section>

          <section>
            <h2>4. Penyimpanan dan Keamanan Data</h2>
            <p>
              Kami menyimpan data Anda di server yang aman dan menggunakan
              langkah-langkah keamanan standar industri untuk melindungi
              informasi Anda. Kami menggunakan Supabase sebagai penyedia layanan
              database dan autentikasi yang memenuhi standar keamanan tinggi.
            </p>
          </section>

          <section>
            <h2>5. Berbagi Data dengan Pihak Ketiga</h2>
            <p>
              Kami tidak menjual data pribadi Anda kepada pihak ketiga. Kami
              hanya membagikan informasi dengan:
            </p>
            <ul>
              <li>Penyedia layanan yang membantu operasional kami</li>
              <li>Mitra iklan (Google AdSense) untuk keperluan periklanan</li>
              <li>Pihak berwenang jika diwajibkan oleh hukum</li>
            </ul>
          </section>

          <section>
            <h2>6. Hak Pengguna</h2>
            <p>Anda memiliki hak untuk:</p>
            <ul>
              <li>Mengakses data pribadi Anda yang kami simpan</li>
              <li>Meminta perbaikan data yang tidak akurat</li>
              <li>Meminta penghapusan data pribadi Anda</li>
              <li>Menolak pemrosesan data untuk tujuan tertentu</li>
            </ul>
          </section>

          <section>
            <h2>7. Perubahan Kebijakan</h2>
            <p>
              Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu.
              Perubahan akan diposting di halaman ini dengan tanggal pembaruan
              terbaru.
            </p>
          </section>

          <section>
            <h2>8. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini,
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
