import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog-data";
import { getPromptWorkspaceData } from "@/lib/prompt-data";
import { createCookieSupabaseClient } from "@/lib/supabase-server";
import { LibraryDashboard } from "@/components/library-dashboard";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TutorialDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  const [workspace, allBlogPosts, supabase] = await Promise.all([
    getPromptWorkspaceData(),
    getBlogPosts(),
    createCookieSupabaseClient(),
  ]);

  let isSuperadmin = false;
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      isSuperadmin = profile?.role === "superadmin";
    }
  }

  const blogPosts = allBlogPosts;

  return (
    <main className="min-h-screen bg-[var(--color-sky-wash)] text-[var(--color-obsidian)]">
      <LibraryDashboard workspace={workspace} isSuperadmin={isSuperadmin} blogPosts={blogPosts} initialTab="tutorials">
        <article className="mx-auto max-w-3xl space-y-8">
          {/* Back */}
          <Link
            href="/library?tab=tutorials"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-silver-pine)] transition-colors hover:text-[var(--color-obsidian)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Tutorial
          </Link>

      {/* Cover */}
      {post.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverUrl}
          alt={post.title}
          className="w-full rounded-[32px] object-cover shadow-[var(--shadow-lg)]"
          style={{ maxHeight: "440px" }}
        />
      )}

      {/* Header */}
      <div className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] md:p-10">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-whisper-fade-blue)] px-3 py-1 text-xs font-bold text-[var(--color-electric-blue)]"
              >
                <Tag className="h-3 w-3" />#{tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-aeonik text-4xl leading-tight tracking-[-0.03em] text-[var(--color-obsidian)] md:text-5xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-4 text-lg font-medium leading-7 text-[var(--color-silver-pine)]">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-[rgba(83,88,98,0.1)] pt-6 text-sm text-[var(--color-ash-gray)]">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {post.readTime} menit baca
          </span>
          {post.publishedAt && (
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="blog-content rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] md:p-10"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Footer CTA */}
      <div className="rounded-[32px] bg-[var(--color-midnight-ink)] p-6 text-center text-white dark:text-[var(--color-sky-wash)] shadow-[var(--shadow-lg)] md:p-8">
        <p className="font-aeonik text-2xl tracking-[-0.02em]">Sudah paham konsepnya?</p>
        <p className="mt-2 text-sm font-medium text-white/70 dark:text-[var(--color-sky-wash)]/70">
          Coba langsung gunakan prompt yang ada di library untuk praktik nyata.
        </p>
        <Link
          href="/library"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 px-6 py-3 text-sm font-bold text-[var(--color-midnight-ink)] transition-all hover:bg-[var(--color-electric-blue)] hover:text-white"
        >
          Buka Prompt Library →
        </Link>
      </div>
    </article>
      </LibraryDashboard>
    </main>
  );
}
