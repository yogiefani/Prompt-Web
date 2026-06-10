import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function createBrowserSupabaseClient() {
  if (!isSupabaseConfigured) return null;

  return createBrowserClient(supabaseUrl as string, supabaseAnonKey as string);
}

export const supabase = createBrowserSupabaseClient();

export type UserRole = "superadmin" | "access";

export type PromptRecord = {
  id: string;
  title: string;
  body: string;
  category_id: string;
  ai_model: string;
  tags: string[];
  variables: Record<string, string>;
  is_featured: boolean;
  created_at: string;
};
