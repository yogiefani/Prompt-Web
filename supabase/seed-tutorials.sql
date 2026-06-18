-- Tutorial drafts for the PromptVault OS superadmin CMS.
-- Re-running this file will not overwrite tutorials already edited in the dashboard.

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  cover_url,
  content,
  tags,
  read_time,
  status,
  published_at
)
values
  (
    'Membuat Feed Design Kampus dengan Codex dari Referensi Pinterest',
    'feed-design-kampus-codex-referensi-pinterest',
    'Workflow mengubah referensi visual Pinterest menjadi feed kampus yang konsisten, responsif, dan siap dikembangkan dengan Codex.',
    '',
    $content$
      <h2>Hasil yang Akan Dibuat</h2>
      <p>Feed design kampus dengan identitas visual yang konsisten berdasarkan reference board Pinterest.</p>
      <p><strong>[Tambahkan gambar hasil akhir di sini]</strong></p>
      <h2>Persiapan</h2>
      <ul><li>Kumpulan reference Pinterest</li><li>Logo dan warna kampus</li><li>Copy untuk setiap slide</li><li>Project Codex yang sudah siap</li></ul>
      <h2>Langkah Pengerjaan</h2>
      <ol><li>[Tambahkan langkah memilih reference]</li><li>[Tambahkan langkah menyusun design system]</li><li>[Tambahkan langkah memberikan brief ke Codex]</li><li>[Tambahkan langkah revisi dan export]</li></ol>
      <h2>Prompt Utama</h2>
      <pre>Buat feed design kampus berdasarkan reference terlampir. Analisis layout, hierarchy, tipografi, warna, dan pola visualnya. Jangan menyalin identitas brand asli. Adaptasikan menjadi identitas kampus [nama kampus] untuk konten [tema konten].</pre>
    $content$,
    array['codex', 'design', 'kampus', 'pinterest', 'social-media'],
    8,
    'draft',
    null
  ),
  (
    'Membuat Carousel Edukasi BEM dengan Codex dari Referensi Instagram',
    'carousel-edukasi-bem-codex-referensi-instagram',
    'Panduan menyusun carousel edukasi organisasi kampus dari referensi Instagram tanpa kehilangan identitas brand sendiri.',
    '',
    $content$
      <h2>Tujuan Tutorial</h2><p>Membuat carousel BEM yang mudah dibaca dan konsisten untuk konten edukasi mahasiswa.</p>
      <p><strong>[Tambahkan cover atau preview carousel]</strong></p>
      <h2>Materi yang Dibutuhkan</h2><ul><li>Screenshot reference Instagram</li><li>Logo organisasi</li><li>Palet warna</li><li>Naskah carousel</li></ul>
      <h2>Langkah Pengerjaan</h2><ol><li>[Analisis reference]</li><li>[Susun struktur slide]</li><li>[Generate layout dengan Codex]</li><li>[Review keterbacaan mobile]</li></ol>
      <h2>Prompt Utama</h2><pre>Gunakan screenshot reference sebagai inspirasi layout. Buat carousel edukasi BEM sebanyak [jumlah slide] dengan topik [topik]. Pertahankan hierarchy yang kuat dan pastikan semua teks terbaca pada layar ponsel.</pre>
    $content$,
    array['codex', 'carousel', 'bem', 'instagram', 'education'],
    7,
    'draft',
    null
  ),
  (
    'Membuat Poster Event Kampus dengan Codex dari Moodboard Behance',
    'poster-event-kampus-codex-moodboard-behance',
    'Dari moodboard Behance menjadi poster event kampus yang punya hierarchy informasi dan visual yang kuat.',
    '',
    $content$
      <h2>Hasil Akhir</h2><p>Poster digital event kampus untuk Instagram feed dan story.</p>
      <p><strong>[Tambahkan gambar before dan after]</strong></p>
      <h2>Persiapan</h2><ul><li>Moodboard Behance</li><li>Nama dan tanggal event</li><li>Daftar pembicara</li><li>CTA pendaftaran</li></ul>
      <h2>Langkah Pengerjaan</h2><ol><li>[Pilih arah visual]</li><li>[Ekstrak design tokens]</li><li>[Bangun komposisi poster]</li><li>[Buat varian feed dan story]</li></ol>
      <h2>Prompt Utama</h2><pre>Analisis moodboard terlampir dan buat poster event kampus bertema [tema]. Prioritaskan nama acara, tanggal, pembicara, lalu CTA. Buat komposisi modern yang tetap mudah dibaca.</pre>
    $content$,
    array['codex', 'poster', 'kampus', 'behance', 'event'],
    8,
    'draft',
    null
  ),
  (
    'Membuat Landing Page UKM Kampus dengan Codex dari Referensi Awwwards',
    'landing-page-ukm-kampus-codex-referensi-awwwards',
    'Workflow membangun landing page UKM kampus yang ekspresif tetapi tetap cepat, responsif, dan mudah digunakan.',
    '',
    $content$
      <h2>Target Hasil</h2><p>Landing page UKM dengan hero, program kerja, galeri, prestasi, dan CTA pendaftaran.</p>
      <p><strong>[Tambahkan screenshot desktop dan mobile]</strong></p>
      <h2>Langkah Pengerjaan</h2><ol><li>[Audit reference Awwwards]</li><li>[Tentukan section dan content hierarchy]</li><li>[Implementasi dengan Codex]</li><li>[Uji responsive dan performa]</li></ol>
      <h2>Prompt Utama</h2><pre>Buat landing page UKM [nama UKM] berdasarkan reference terlampir. Ambil prinsip layout dan interaksinya, bukan brand aslinya. Gunakan Next.js, Tailwind CSS, dan animasi Framer Motion yang halus.</pre>
    $content$,
    array['codex', 'landing-page', 'kampus', 'awwwards', 'nextjs'],
    10,
    'draft',
    null
  ),
  (
    'Membuat Website Portofolio Mahasiswa dengan Codex dari Referensi Dribbble',
    'website-portofolio-mahasiswa-codex-dribbble',
    'Menerjemahkan visual Dribbble menjadi website portofolio mahasiswa yang nyata, navigable, dan tidak sekadar mockup.',
    '',
    $content$
      <h2>Hasil yang Akan Dibuat</h2><p>Website portofolio dengan profil, project, skill, pengalaman, dan kontak.</p>
      <p><strong>[Tambahkan preview website]</strong></p>
      <h2>Langkah Pengerjaan</h2><ol><li>[Pilih reference yang realistis]</li><li>[Petakan komponen UI]</li><li>[Siapkan data project]</li><li>[Implementasi dan polishing]</li></ol>
      <h2>Prompt Utama</h2><pre>Ubah reference Dribbble ini menjadi website portofolio yang benar-benar bisa digunakan. Pertahankan ritme visualnya, tetapi buat navigasi, responsive state, dan konten project yang lengkap.</pre>
    $content$,
    array['codex', 'portfolio', 'student', 'dribbble', 'website'],
    9,
    'draft',
    null
  ),
  (
    'Membuat Feed Katalog UMKM dengan Codex dari Referensi Pinterest',
    'feed-katalog-umkm-codex-pinterest',
    'Membangun sistem feed katalog produk UMKM yang mudah dipakai ulang untuk banyak produk dan promo.',
    '',
    $content$
      <h2>Target Hasil</h2><p>Template katalog produk untuk feed, story, dan promo musiman.</p>
      <p><strong>[Tambahkan foto produk dan hasil desain]</strong></p>
      <h2>Langkah Pengerjaan</h2><ol><li>[Kurasi reference]</li><li>[Pisahkan elemen tetap dan dinamis]</li><li>[Bangun template reusable]</li><li>[Masukkan data produk]</li></ol>
      <h2>Prompt Utama</h2><pre>Buat sistem feed katalog untuk brand [nama brand]. Gunakan reference Pinterest terlampir untuk memahami komposisi. Sediakan komponen reusable untuk foto, nama produk, harga, promo, dan CTA.</pre>
    $content$,
    array['codex', 'umkm', 'catalog', 'pinterest', 'social-media'],
    8,
    'draft',
    null
  ),
  (
    'Membuat Campaign Webinar dengan Codex dari Satu Reference Design',
    'campaign-webinar-codex-satu-reference-design',
    'Cara mengembangkan satu reference menjadi satu set campaign lengkap: poster, countdown, speaker card, dan reminder.',
    '',
    $content$
      <h2>Output Campaign</h2><p>Poster utama, speaker card, countdown, reminder, dan thank-you post.</p>
      <p><strong>[Tambahkan seluruh aset campaign]</strong></p>
      <h2>Langkah Pengerjaan</h2><ol><li>[Analisis DNA visual reference]</li><li>[Buat design tokens]</li><li>[Bangun komponen campaign]</li><li>[Generate seluruh varian]</li></ol>
      <h2>Prompt Utama</h2><pre>Kembangkan reference ini menjadi design system campaign webinar. Buat varian poster utama, profil pembicara, countdown, reminder, dan recap dengan hierarchy yang konsisten.</pre>
    $content$,
    array['codex', 'webinar', 'campaign', 'design-system', 'event'],
    9,
    'draft',
    null
  ),
  (
    'Membuat Social Media Kit Penerimaan Mahasiswa Baru dengan Codex',
    'social-media-kit-pmb-dengan-codex',
    'Membuat paket konten PMB yang konsisten dari hero campaign sampai FAQ dan deadline reminder.',
    '',
    $content$
      <h2>Hasil Akhir</h2><p>Social media kit PMB untuk feed dan story dalam satu identitas visual.</p>
      <p><strong>[Tambahkan contoh setiap format]</strong></p>
      <h2>Langkah Pengerjaan</h2><ol><li>[Susun content matrix]</li><li>[Tentukan visual direction]</li><li>[Bangun template komponen]</li><li>[Review konsistensi seluruh aset]</li></ol>
      <h2>Prompt Utama</h2><pre>Buat social media kit PMB untuk [nama kampus]. Gunakan reference terlampir sebagai arah visual. Siapkan template announcement, program studi, fasilitas, FAQ, deadline, dan CTA pendaftaran.</pre>
    $content$,
    array['codex', 'pmb', 'kampus', 'campaign', 'social-media'],
    10,
    'draft',
    null
  ),
  (
    'Mengubah Screenshot Dashboard Dribbble Menjadi Next.js dengan Codex',
    'screenshot-dashboard-dribbble-nextjs-codex',
    'Panduan membedah screenshot dashboard lalu membangun ulang struktur, data state, dan interaksi nyata dengan Codex.',
    '',
    $content$
      <h2>Target Hasil</h2><p>Dashboard Next.js yang responsif dan operasional, bukan hanya salinan visual.</p>
      <p><strong>[Tambahkan screenshot reference dan implementasi]</strong></p>
      <h2>Langkah Pengerjaan</h2><ol><li>[Identifikasi layout dan komponen]</li><li>[Definisikan data dan state]</li><li>[Implementasi bertahap]</li><li>[Bandingkan hasil dengan reference]</li></ol>
      <h2>Prompt Utama</h2><pre>Pelajari screenshot dashboard ini. Pecah menjadi layout, navigation, table, filters, cards, dan states. Implementasikan dengan Next.js dan Tailwind CSS sebagai aplikasi yang benar-benar interaktif.</pre>
    $content$,
    array['codex', 'dashboard', 'dribbble', 'nextjs', 'frontend'],
    11,
    'draft',
    null
  ),
  (
    'Membuat Brand Moodboard dengan AI sebelum Coding di Codex',
    'brand-moodboard-ai-sebelum-coding-codex',
    'Menyusun arah visual, warna, tipografi, dan image direction agar hasil coding Codex lebih konsisten sejak awal.',
    '',
    $content$
      <h2>Tujuan Tutorial</h2><p>Menghasilkan moodboard dan creative direction yang siap diterjemahkan menjadi UI.</p>
      <p><strong>[Tambahkan moodboard final]</strong></p>
      <h2>Langkah Pengerjaan</h2><ol><li>[Definisikan brand personality]</li><li>[Kumpulkan reference]</li><li>[Susun design tokens]</li><li>[Ubah moodboard menjadi brief Codex]</li></ol>
      <h2>Prompt Utama</h2><pre>Berdasarkan moodboard terlampir, rangkum creative direction menjadi warna, typography scale, spacing, radius, imagery, dan interaction principles yang dapat diimplementasikan pada website.</pre>
    $content$,
    array['codex', 'branding', 'moodboard', 'design-system', 'ai'],
    7,
    'draft',
    null
  ),
  (
    'Redesign Website Organisasi dengan Codex dari Referensi Kompetitor',
    'redesign-website-organisasi-codex-referensi-kompetitor',
    'Menggunakan beberapa website kompetitor sebagai bahan riset untuk redesign yang lebih jelas dan tetap original.',
    '',
    $content$
      <h2>Hasil yang Akan Dibuat</h2><p>Redesign website organisasi dengan information architecture dan visual hierarchy baru.</p>
      <p><strong>[Tambahkan audit lama dan hasil redesign]</strong></p>
      <h2>Langkah Pengerjaan</h2><ol><li>[Audit website lama]</li><li>[Bandingkan kompetitor]</li><li>[Susun sitemap baru]</li><li>[Implementasi redesign]</li></ol>
      <h2>Prompt Utama</h2><pre>Audit website lama dan reference kompetitor berikut. Temukan pola terbaik tanpa menyalin. Buat sitemap, hierarchy konten, design direction, lalu implementasikan redesign yang lebih jelas dan responsif.</pre>
    $content$,
    array['codex', 'redesign', 'research', 'website', 'organization'],
    10,
    'draft',
    null
  ),
  (
    'Workflow Screenshot ke Code: Dari Reference Pinterest sampai UI Siap Pakai',
    'workflow-screenshot-ke-code-reference-pinterest',
    'Workflow lengkap mengubah reference gambar menjadi UI responsif melalui analisis, planning, coding, dan visual QA.',
    '',
    $content$
      <h2>Workflow Lengkap</h2><p>Reference visual diubah menjadi halaman nyata yang responsif dan siap diuji.</p>
      <p><strong>[Tambahkan diagram workflow]</strong></p>
      <h2>Langkah Pengerjaan</h2><ol><li>[Kumpulkan reference dan aset]</li><li>[Analisis komponen dan constraints]</li><li>[Beri task bertahap ke Codex]</li><li>[Lakukan screenshot comparison]</li><li>[Polish responsive dan interaction]</li></ol>
      <h2>Prompt Utama</h2><pre>Analisis reference terlampir secara visual. Identifikasi layout, typography, spacing, color, component states, dan responsive behavior. Buat rencana implementasi lalu bangun UI secara bertahap dan verifikasi dengan screenshot.</pre>
    $content$,
    array['codex', 'screenshot-to-code', 'pinterest', 'workflow', 'visual-qa'],
    12,
    'draft',
    null
  )
on conflict (slug) do nothing;

