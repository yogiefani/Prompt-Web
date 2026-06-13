import { getBlogPosts } from "@/lib/blog-data";
import { BlogList } from "@/components/blog-list";
import { FadeIn } from "@/components/motion-primitives";

export const dynamic = "force-dynamic";

export default async function TutorialsPage() {
  const posts = await getBlogPosts();
  const published = posts.filter((p) => p.status === "published");

  return (
    <FadeIn className="space-y-8">
      <div className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
        <div className="flex flex-col gap-2">
          <span className="rounded-full bg-[var(--color-whisper-fade-blue)] px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)] w-fit">
            Tutorial & Panduan
          </span>
          <h2 className="mt-3 max-w-2xl font-aeonik text-4xl leading-tight tracking-[-0.02em]">
            Pelajari cara kerja AI prompting dari nol sampai mahir.
          </h2>
          <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-[var(--color-silver-pine)]">
            Artikel tutorial eksklusif yang dibuat khusus untuk member PromptVault OS. Mulai dari dasar hingga teknik lanjutan.
          </p>
        </div>
      </div>
      <BlogList posts={published} />
    </FadeIn>
  );
}
