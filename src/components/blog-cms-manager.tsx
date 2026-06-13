"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Clock,
  Edit2,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BlogEditor } from "@/components/blog-editor";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string;
  content: string;
  tags: string[];
  readTime: number;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapRow(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: (row.excerpt as string) ?? "",
    coverUrl: (row.cover_url as string) ?? "",
    content: (row.content as string) ?? "",
    tags: (row.tags as string[]) ?? [],
    readTime: (row.read_time as number) ?? 1,
    status: (row.status as "draft" | "published") ?? "draft",
    publishedAt: (row.published_at as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function BlogCmsManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published">("all");
  const [deleting, setDeleting] = useState<string>("");

  const fetchPosts = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data.map((r) => mapRow(r as Record<string, unknown>)));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function handleNewPost() {
    setEditingPost(null);
    setView("editor");
  }

  function handleEdit(post: BlogPost) {
    setEditingPost(post);
    setView("editor");
  }

  function handleSaved() {
    setView("list");
    fetchPosts();
  }

  async function handleDelete(id: string) {
    if (!supabase) return;
    const confirmed = window.confirm("Yakin hapus artikel ini? Tindakan ini tidak bisa dibatalkan.");
    if (!confirmed) return;
    setDeleting(id);
    await supabase.from("blog_posts").delete().eq("id", id);
    setDeleting("");
    fetchPosts();
  }

  async function toggleStatus(post: BlogPost) {
    if (!supabase) return;
    const newStatus = post.status === "published" ? "draft" : "published";
    await supabase
      .from("blog_posts")
      .update({
        status: newStatus,
        published_at: newStatus === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);
    fetchPosts();
  }

  const filtered = posts.filter((p) => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (view === "editor") {
    return (
      <BlogEditor
        initialPost={editingPost}
        onSaved={handleSaved}
        onCancel={() => setView("list")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-aeonik text-2xl tracking-[-0.02em] text-[var(--color-obsidian)]">
            Blog & Tutorial CMS
          </h2>
          <p className="mt-1 text-sm font-medium text-[var(--color-silver-pine)]">
            Kelola artikel tutorial untuk member. Drag, tulis, publish.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewPost}
          className="primary-button inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tulis Artikel Baru
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-[24px] bg-white p-4 shadow-[var(--shadow-lg)] sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-[rgba(83,88,98,0.16)] bg-[var(--color-arctic-mist)] px-4 py-2.5">
          <Search className="h-4 w-4 text-[var(--color-silver-pine)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[var(--color-ash-gray)]"
            placeholder="Cari judul atau excerpt..."
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                filterStatus === s
                  ? "bg-[var(--color-midnight-ink)] text-white"
                  : "bg-[var(--color-arctic-mist)] text-[var(--color-silver-pine)] hover:bg-[var(--color-sky-wash)]"
              }`}
            >
              {s === "all" ? "Semua" : s === "published" ? "Published" : "Draft"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Artikel", value: posts.length, icon: BookOpen, color: "blue" },
          { label: "Published", value: posts.filter((p) => p.status === "published").length, icon: Globe, color: "emerald" },
          { label: "Draft", value: posts.filter((p) => p.status === "draft").length, icon: Edit2, color: "amber" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-lg)]">
            <p className="text-sm font-semibold text-[var(--color-silver-pine)]">{stat.label}</p>
            <p className="mt-2 font-aeonik text-4xl tracking-[-0.02em] text-[var(--color-obsidian)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-electric-blue)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[32px] bg-white py-20 shadow-[var(--shadow-lg)]">
          <BookOpen className="h-12 w-12 text-[var(--color-ash-gray)]" />
          <div className="text-center">
            <p className="font-aeonik text-xl text-[var(--color-obsidian)]">Belum ada artikel</p>
            <p className="mt-1 text-sm text-[var(--color-silver-pine)]">Klik "Tulis Artikel Baru" untuk mulai.</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="group flex items-start gap-4 rounded-[24px] bg-white p-5 shadow-[var(--shadow-lg)] transition-all hover:shadow-[var(--shadow-lg)]"
              >
                {/* Cover thumb */}
                {post.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverUrl}
                    alt=""
                    className="h-20 w-28 flex-shrink-0 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--color-arctic-mist)]">
                    <BookOpen className="h-7 w-7 text-[var(--color-ash-gray)]" />
                  </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            post.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${post.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {post.status}
                        </span>
                        <span className="text-xs text-[var(--color-ash-gray)]">/{post.slug}</span>
                      </div>
                      <h3 className="mt-1.5 font-aeonik text-lg leading-snug tracking-[-0.02em] text-[var(--color-obsidian)]">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-1 line-clamp-1 text-sm text-[var(--color-silver-pine)]">{post.excerpt}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        title={post.status === "published" ? "Tarik ke Draft" : "Publish"}
                        onClick={() => toggleStatus(post)}
                        className={`icon-button ${post.status === "published" ? "" : "text-emerald-600 hover:bg-emerald-50"}`}
                      >
                        {post.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => handleEdit(post)}
                        className="icon-button"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Hapus"
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className="icon-button hover:bg-red-50 hover:text-red-500"
                      >
                        {deleting === post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-ash-gray)]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime} menit baca
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {post.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        {post.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
