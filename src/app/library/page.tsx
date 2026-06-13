import { getPromptWorkspaceData } from "@/lib/prompt-data";
import { createCookieSupabaseClient } from "@/lib/supabase-server";
import { LibraryDashboard } from "@/components/library-dashboard";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const workspace = await getPromptWorkspaceData();
  const supabase = await createCookieSupabaseClient();
  let isSuperadmin = false;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isSuperadmin = profile?.role === "superadmin";
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-sky-wash)] text-[var(--color-obsidian)]">
      <LibraryDashboard workspace={workspace} isSuperadmin={isSuperadmin} />
    </main>
  );
}
