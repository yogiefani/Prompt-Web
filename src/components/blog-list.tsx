"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Calendar, Clock, Search, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { BlogPostListItem } from "@/lib/blog-data";

type BlogListProps = {
  posts: BlogPostListItem[];
  maxItems?: number; // Optional prop to limit items (e.g. for landing page)
  basePath?: string; // Base path for tutorial links
};

export function BlogList({ posts, maxItems, basePath = "/tutorials" }: BlogListProps) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const allTags = ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags)))];

  const filtered = posts.filter((p) => {
    const matchTag = activeTag === "All" || p.tags.includes(activeTag);
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const displayPosts = maxItems ? filtered.slice(0, maxItems) : filtered;

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 py-24 shadow-[var(--shadow-lg)]">
        <BookOpen className="h-12 w-12 text-[var(--color-ash-gray)]" />
        <div className="text-center">
          <p className="font-aeonik text-xl text-[var(--color-obsidian)]">Belum ada tutorial</p>
          <p className="mt-1 text-sm text-[var(--color-silver-pine)]">
            Tutorial dari tim akan segera hadir di sini.
          </p>
        </div>
      </div>
    );
  }

  // Split featured and remaining only if not limited (i.e. not on landing page)
  const isLandingPage = !!maxItems;
  const featuredPost = !isLandingPage && displayPosts.length > 0 ? displayPosts[0] : null;
  const gridPosts = featuredPost ? displayPosts.slice(1) : displayPosts;

  return (
    <div className="space-y-10">
      {/* Search + tag filter (Hide on landing page) */}
      {!isLandingPage && (
        <div className="flex flex-col gap-4 rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-4 shadow-[var(--shadow-lg)] md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-full border border-[rgba(83,88,98,0.16)] bg-[var(--color-arctic-mist)] px-4 py-3 transition-colors focus-within:border-[var(--color-electric-blue)] focus-within:bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10">
            <Search className="h-4 w-4 text-[var(--color-silver-pine)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[var(--color-ash-gray)]"
              placeholder="Cari panduan atau tutorial..."
            />
          </div>
          {allTags.length > 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`flex-shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
                    activeTag === tag
                      ? "bg-[var(--color-obsidian)] text-white"
                      : "bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 text-[var(--color-silver-pine)] hover:bg-[var(--color-sky-wash)]"
                  }`}
                >
                  {tag === "All" ? "Semua Topik" : `#${tag}`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 py-16 shadow-[var(--shadow-lg)]">
          <Search className="h-10 w-10 text-[var(--color-ash-gray)]" />
          <p className="text-sm font-semibold text-[var(--color-silver-pine)]">Tidak ada hasil pencarian.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {/* Featured Post */}
            {featuredPost && (
              <motion.article
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="group relative flex flex-col overflow-hidden rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 shadow-[var(--shadow-lg)] transition-all hover:shadow-xl md:flex-row"
              >
                {/* Cover */}
                <div className="relative h-64 w-full flex-shrink-0 md:h-auto md:w-1/2 lg:w-3/5">
                  {featuredPost.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featuredPost.coverUrl}
                      alt={featuredPost.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-whisper-fade-blue)] to-[var(--color-mint-glaze)]">
                      <BookOpen className="h-16 w-16 text-[var(--color-electric-blue)] opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-center p-8 md:p-12">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[var(--color-whisper-fade-blue)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-electric-blue)]">
                      Featured
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ash-gray)] md:text-[var(--color-silver-pine)]">
                      <Clock className="h-3.5 w-3.5" />
                      {featuredPost.readTime} mnt
                    </div>
                  </div>

                  <h2 className="font-aeonik text-2xl font-bold leading-tight tracking-[-0.02em] text-[var(--color-obsidian)] md:text-4xl">
                    <Link href={`${basePath}/${featuredPost.slug}`} className="hover:underline">
                      {featuredPost.title}
                    </Link>
                  </h2>

                  {featuredPost.excerpt && (
                    <p className="mt-4 line-clamp-3 text-base font-medium leading-relaxed text-[var(--color-silver-pine)]">
                      {featuredPost.excerpt}
                    </p>
                  )}

                  <div className="mt-8">
                    <Link
                      href={`${basePath}/${featuredPost.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-midnight-ink)] px-6 py-3 text-sm font-bold text-white dark:text-[var(--color-sky-wash)] transition-all hover:bg-[var(--color-electric-blue)]"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            )}

            {/* Grid Posts */}
            {gridPosts.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post, i) => (
                  <motion.article
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                    className="group flex flex-col overflow-hidden rounded-[28px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 shadow-sm ring-1 ring-[rgba(83,88,98,0.1)] transition-all hover:shadow-[var(--shadow-lg)]"
                  >
                    {/* Cover */}
                    {post.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverUrl}
                        alt={post.title}
                        className="h-48 w-full flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="flex h-48 w-full flex-shrink-0 items-center justify-center bg-gradient-to-br from-[var(--color-whisper-fade-blue)] to-[var(--color-mint-glaze)]">
                        <BookOpen className="h-12 w-12 text-[var(--color-electric-blue)] opacity-40" />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-6">
                      {post.tags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[var(--color-sky-wash)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-obsidian)]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <h3 className="font-aeonik text-xl font-bold leading-snug tracking-[-0.02em] text-[var(--color-obsidian)] line-clamp-2">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="mt-3 line-clamp-2 flex-1 text-sm font-medium leading-relaxed text-[var(--color-silver-pine)]">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="mt-6 flex items-center justify-between border-t border-[rgba(83,88,98,0.1)] pt-5">
                        <div className="flex items-center gap-3 text-xs font-semibold text-[var(--color-ash-gray)]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {post.readTime} mnt
                          </span>
                        </div>
                        <Link
                          href={`${basePath}/${post.slug}`}
                          className="inline-flex items-center justify-center rounded-full bg-[var(--color-arctic-mist)] p-2 text-[var(--color-obsidian)] transition-colors hover:bg-[var(--color-electric-blue)] hover:text-white"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
