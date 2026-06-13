import { createCookieSupabaseClient } from "@/lib/supabase-server";

export type BlogPostStatus = "draft" | "published";

export type BlogPostView = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string;
  content: string;
  tags: string[];
  readTime: number;
  status: BlogPostStatus;
  authorId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostListItem = Omit<BlogPostView, "content">;

function mapRow(row: Record<string, unknown>): BlogPostView {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: (row.excerpt as string) ?? "",
    coverUrl: (row.cover_url as string) ?? "",
    content: (row.content as string) ?? "",
    tags: (row.tags as string[]) ?? [],
    readTime: (row.read_time as number) ?? 1,
    status: (row.status as BlogPostStatus) ?? "draft",
    authorId: (row.author_id as string) ?? null,
    publishedAt: (row.published_at as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** Fetch all posts visible to the current user (published + all for superadmin) */
export async function getBlogPosts(): Promise<BlogPostListItem[]> {
  const supabase = await createCookieSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_url, tags, read_time, status, author_id, published_at, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => {
    const v = mapRow(row as Record<string, unknown>);
    const { content: _content, ...rest } = v;
    void _content;
    return rest;
  });
}

/** Fetch a single published blog post by slug */
export async function getBlogPostBySlug(slug: string): Promise<BlogPostView | null> {
  const supabase = await createCookieSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}
