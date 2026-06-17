"use server";

import { createCookieSupabaseClient } from "@/lib/supabase-server";

export async function markTutorialAsSeen() {
  const supabase = await createCookieSupabaseClient();
  if (!supabase) return { error: "Supabase client not initialized" };

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ has_seen_tutorial: true })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating tutorial status:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in markTutorialAsSeen:", error);
    return { error: error.message || "Internal server error" };
  }
}
