import { NextResponse, type NextRequest } from "next/server";
import { createCookieSupabaseClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase-admin";

async function isSuperadminRequest() {
  const supabase = await createCookieSupabaseClient();

  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    return NextResponse.json({ error: "Unauthorized access grant request." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
      { status: 500 }
    );
  }

  const { email, fullName, provider, productId } = await request.json();
  const trimmedEmail = email?.trim().toLowerCase();

  if (!trimmedEmail) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin client is not configured." }, { status: 500 });
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(trimmedEmail, {
    data: {
      full_name: fullName ?? "",
      access_source: provider ?? "manual",
      product_id: productId ?? "",
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/set-password`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Update status di tabel access_grants menjadi "invited"
  const { error: grantError } = await admin
    .from("access_grants")
    .update({ status: "invited" })
    .eq("email", trimmedEmail);

  if (grantError) {
    console.error("Gagal memperbarui status grant:", grantError.message);
  }

  return NextResponse.json({
    ok: true,
    email: trimmedEmail,
    userId: data.user.id,
  });
}
