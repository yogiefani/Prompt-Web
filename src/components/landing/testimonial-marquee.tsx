import { Star } from "lucide-react";

const testimonials = [
  {
    body: "Sejak pakai PromptVault OS, tim marketing kami tidak pernah lagi kehilangan prompt SEO yang sudah susah-susah diriset. Sistem variabelnya jenius!",
    author: "Budi Santoso",
    role: "SEO Specialist",
    img: "11"
  },
  {
    body: "Sebagai creator yang berjualan produk digital, platform ini sangat membantu saya mendistribusikan prompt premium ke ratusan member tanpa repot.",
    author: "Siti Amelia",
    role: "Content Creator",
    img: "32"
  },
  {
    body: "Fitur Blog & CMS nya sangat memudahkan saya membuat panduan cara memakai setiap prompt. UX-nya seperti platform seharga jutaan!",
    author: "Reza Rahadian",
    role: "Digital Marketer",
    img: "33"
  },
  {
    body: "Dulu pusing nyari prompt di Notion berantakan. Sekarang tinggal ketik keyword di kolom search, klik copy, langsung paste ke ChatGPT.",
    author: "Dian Sastro",
    role: "Copywriter",
    img: "44"
  },
  {
    body: "Investasi terbaik tahun ini. Semua koleksi prompt Midjourney dan Claude saya tersimpan rapi dan aman.",
    author: "Agus Supriyadi",
    role: "AI Enthusiast",
    img: "55"
  },
  {
    body: "Tampilan dashboardnya sangat elegan dan modern. Member saya merasa sangat puas karena experience-nya terasa sangat premium.",
    author: "Rina Wati",
    role: "Course Creator",
    img: "66"
  }
];

export function TestimonialMarquee() {
  return (
    <section className="overflow-hidden bg-[var(--color-sky-wash)] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-aeonik text-3xl font-bold tracking-[-0.02em] text-[var(--color-obsidian)] sm:text-4xl">
            Dipercaya oleh Ribuan Profesional
          </h2>
          <p className="mt-4 text-lg font-medium text-[var(--color-silver-pine)]">
            Jangan hanya percaya pada kata-kata kami. Dengarkan langsung dari pengguna yang telah meningkatkan produktivitas mereka.
          </p>
        </div>
      </div>
      
      <div className="relative mt-16 flex w-full flex-col gap-6">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-6 pl-6 hover:[animation-play-state:paused]">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} className="w-[350px] shrink-0 rounded-3xl border border-[rgba(83,88,98,0.1)] bg-white p-8 shadow-sm transition-shadow hover:shadow-md sm:w-[400px]">
              <div className="flex gap-1 text-[var(--color-sunburst-yellow)]">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-base font-medium leading-relaxed text-[var(--color-obsidian)]">
                &quot;{t.body}&quot;
              </p>
              <div className="mt-8 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://i.pravatar.cc/100?img=${t.img}`} alt={t.author} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-aeonik text-base font-bold tracking-[-0.01em] text-[var(--color-obsidian)]">{t.author}</h4>
                  <p className="text-sm font-medium text-[var(--color-silver-pine)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
