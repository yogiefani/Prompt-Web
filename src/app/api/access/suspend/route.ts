import { NextResponse, type NextRequest } from "next/server";
import { createCookieSupabaseClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase-admin";

type AccessSuspendPayload = {
  grantId: string;
  email: string;
  userId?: string;
  action: "suspend" | "activate";
};

async function isSuperadminRequest() {
  const supabase = await createCookieSupabaseClient();
  if (!supabase) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "superadmin";
}

export async function POST(request: NextRequest) {
  const isAllowed = await isSuperadminRequest();

  if (!isAllowed) {
    return NextResponse.json({ error: "Unauthorized access suspend request." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
      { status: 500 }
    );
  }

  const payload = (await request.json()) as AccessSuspendPayload;
  const { grantId, email, userId, action } = payload;

  if (!grantId || !email) {
    return NextResponse.json({ error: "Grant ID and Email are required." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin client is not configured." }, { status: 500 });
  }

  // 1. Ubah status di tabel access_grants
  const newStatus = action === "suspend" ? "suspended" : "granted";
  const { error: grantError } = await admin
    .from("access_grants")
    .update({ status: newStatus })
    .eq("id", grantId);

  if (grantError) {
    return NextResponse.json({ error: grantError.message }, { status: 400 });
  }

  // 2. Ubah role di tabel profiles jika user_id ada
  if (userId) {
    const newRole = action === "suspend" ? "user" : "access";
    const { error: profileError } = await admin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (profileError) {
      console.error("Gagal mengubah role user:", profileError.message);
    }
  }

  return NextResponse.json({
    ok: true,
    email,
    message: action === "suspend" ? "Akses berhasil disuspend." : "Akses berhasil diaktifkan kembali.",
    newStatus
  });
}
