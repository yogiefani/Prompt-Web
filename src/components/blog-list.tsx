"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Calendar, Clock, Search, Tag } from "lucide-react";
import Link from "next/link";
import type { BlogPostListItem } from "@/lib/blog-data";

type BlogListProps = {
  posts: BlogPostListItem[];
};

export function BlogList({ posts }: BlogListProps) {
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

  return (
    <div className="space-y-6">
      {/* Search + tag filter */}
      <div className="flex flex-col gap-4 rounded-[32px] bg-white p-4 shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-3 rounded-full border border-[rgba(83,88,98,0.16)] bg-[var(--color-arctic-mist)] px-4 py-3">
          <Search className="h-4 w-4 text-[var(--color-silver-pine)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[var(--color-ash-gray)]"
            placeholder="Cari tutorial..."
          />
        </div>
        {allTags.length > 1 && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`category-pill flex-shrink-0 ${activeTag === tag ? "active" : ""}`}
              >
                {tag === "All" ? "Semua Topik" : `#${tag}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[32px] bg-white py-24 shadow-[var(--shadow-lg)]">
          <BookOpen className="h-12 w-12 text-[var(--color-ash-gray)]" />
          <div className="text-center">
            <p className="font-aeonik text-xl text-[var(--color-obsidian)]">Belum ada tutorial</p>
            <p className="mt-1 text-sm text-[var(--color-silver-pine)]">
              Tutorial dari tim akan segera hadir di sini.
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[32px] bg-white py-16 shadow-[var(--shadow-lg)]">
          <Search className="h-10 w-10 text-[var(--color-ash-gray)]" />
          <p className="text-sm font-semibold text-[var(--color-silver-pine)]">Tidak ada hasil untuk pencarian ini.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((post, i) => (
              <motion.article
                key={post.id}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                className="prompt-card group flex flex-col overflow-hidden"
              >
                {/* Cover */}
                {post.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverUrl}
                    alt={post.title}
                    className="h-44 w-full flex-shrink-0 object-cover"
                  />
                ) : (
                  <div className="flex h-44 w-full flex-shrink-0 items-center justify-center bg-gradient-to-br from-[var(--color-whisper-fade-blue)] to-[var(--color-mint-glaze)]">
                    <BookOpen className="h-12 w-12 text-[var(--color-electric-blue)] opacity-40" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--color-whisper-fade-blue)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-electric-blue)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="font-aeonik text-xl leading-snug tracking-[-0.02em] text-[var(--color-obsidian)]">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[var(--color-silver-pine)]">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[rgba(83,88,98,0.1)] pt-4">
                    <div className="flex items-center gap-3 text-xs text-[var(--color-ash-gray)]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime} mnt
                      </span>
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(post.publishedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/library/tutorials/${post.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-midnight-ink)] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[var(--color-electric-blue)]"
                    >
                      <Tag className="h-3 w-3" />
                      Baca
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
