import { getPromptWorkspaceData } from "@/lib/prompt-data";
import { getBlogPosts } from "@/lib/blog-data";
import { createCookieSupabaseClient } from "@/lib/supabase-server";
import { LibraryDashboard } from "@/components/library-dashboard";

export const dynamic = "force-dynamic";

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const initialTab = (tab as any) || "library";

  const [workspace, allBlogPosts, supabase] = await Promise.all([
    getPromptWorkspaceData(),
    getBlogPosts(),
    createCookieSupabaseClient(),
  ]);

  let isSuperadmin = false;
  let hasSeenTutorial = false;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, has_seen_tutorial")
        .eq("id", user.id)
        .single();
      isSuperadmin = profile?.role === "superadmin";
      hasSeenTutorial = profile?.has_seen_tutorial ?? false;
    }
  }

  // Users only see published posts; superadmin sees all
  const blogPosts = isSuperadmin
    ? allBlogPosts
    : allBlogPosts.filter((p) => p.status === "published");

  return (
    <main className="min-h-screen bg-[var(--color-sky-wash)] text-[var(--color-obsidian)]">
      <LibraryDashboard workspace={workspace} isSuperadmin={isSuperadmin} blogPosts={blogPosts} initialTab={initialTab} hasSeenTutorial={hasSeenTutorial} />
    </main>
  );
}
