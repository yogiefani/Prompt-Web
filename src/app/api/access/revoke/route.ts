import { NextResponse, type NextRequest } from "next/server";
import { createCookieSupabaseClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase-admin";

type AccessRevokePayload = {
  grantId: string;
  email: string;
  userId?: string;
};

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

async function findAuthUserByEmail(email: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) return null;

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function POST(request: NextRequest) {
  const isAllowed = await isSuperadminRequest();

  if (!isAllowed) {
    return NextResponse.json({ error: "Unauthorized access revoke request." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
      { status: 500 }
    );
  }

  const payload = (await request.json()) as AccessRevokePayload;
  const { grantId, email, userId } = payload;

  if (!grantId || !email) {
    return NextResponse.json({ error: "Grant ID and Email are required." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin client is not configured." }, { status: 500 });
  }

  // 1. Hapus User dari Supabase Auth jika ada
  let finalUserId = userId;
  if (!finalUserId) {
    const authUser = await findAuthUserByEmail(email);
    if (authUser) {
      finalUserId = authUser.id;
    }
  }

  if (finalUserId) {
    const { error: authError } = await admin.auth.admin.deleteUser(finalUserId);
    if (authError) {
      // Jika errornya bukan user not found, log atau kembalikan error
      console.error("Gagal menghapus user dari auth:", authError.message);
    }
  }

  // 2. Hapus baris data dari tabel access_grants
  const { error: grantError } = await admin
    .from("access_grants")
    .delete()
    .eq("id", grantId);

  if (grantError) {
    return NextResponse.json({ error: grantError.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    email,
    message: "Akses berhasil dicabut dan akun dinonaktifkan.",
  });
}
