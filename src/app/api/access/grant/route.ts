import { NextResponse, type NextRequest } from "next/server";
import { createCookieSupabaseClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase-admin";

type AccessGrantPayload = {
  email?: string;
  fullName?: string;
  provider?: string;
  productId?: string;
  metadata?: Record<string, unknown>;
};

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) return "";

  return authorization.slice("Bearer ".length).trim();
}

async function isSuperadminRequest() {
  const supabase = await createCookieSupabaseClient();

  if (!supabase) return { isAllowed: false, userId: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isAllowed: false, userId: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { isAllowed: profile?.role === "superadmin", userId: user.id };
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
  const webhookSecret = process.env.PRODUCT_WEBHOOK_SECRET;
  const requestSecret = request.headers.get("x-webhook-secret") || getBearerToken(request);
  const isWebhook = Boolean(webhookSecret && requestSecret && requestSecret === webhookSecret);
  const superadminAuth = isWebhook ? { isAllowed: true, userId: null } : await isSuperadminRequest();

  if (!superadminAuth.isAllowed) {
    return NextResponse.json({ error: "Unauthorized access grant request." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
      { status: 500 },
    );
  }

  const payload = (await request.json()) as AccessGrantPayload;
  const email = payload.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  if (!admin) {
    return NextResponse.json({ error: "Supabase admin client is not configured." }, { status: 500 });
  }

  let authUser = await findAuthUserByEmail(email);
  let invitationSent = false;

  if (!authUser) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: payload.fullName ?? "",
        access_source: payload.provider ?? "manual",
        product_id: payload.productId ?? "",
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/set-password`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    authUser = data.user;
    invitationSent = true;
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: authUser.id,
    email,
    full_name: payload.fullName ?? authUser.user_metadata?.full_name ?? null,
    role: "access",
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { error: grantError } = await admin.from("access_grants").insert({
    email,
    full_name: payload.fullName ?? null,
    provider: payload.provider ?? (isWebhook ? "webhook" : "manual"),
    product_id: payload.productId ?? null,
    status: invitationSent ? "invited" : "granted",
    metadata: payload.metadata ?? {},
    granted_user_id: authUser.id,
    granted_by: superadminAuth.userId,
  });

  if (grantError) {
    return NextResponse.json({ error: grantError.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    email,
    userId: authUser.id,
    status: invitationSent ? "invited" : "granted",
  });
}
