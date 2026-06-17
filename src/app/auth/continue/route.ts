import { NextRequest, NextResponse } from "next/server";
import { createCookieSupabaseClient } from "@/lib/supabase-server";

function getSafeNextPath(request: NextRequest) {
  const nextPath = request.nextUrl.searchParams.get("next");

  if (!nextPath?.startsWith("/") || nextPath.startsWith("//")) {
    return null;
  }

  return nextPath;
}

export async function GET(request: NextRequest) {
  const supabase = await createCookieSupabaseClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/login?reason=missing-supabase-config", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?reason=auth-required", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isSuperadmin = profile?.role === "superadmin";
  const requestedPath = getSafeNextPath(request);
  const requestsSuperadmin =
    requestedPath === "/superadmin" || requestedPath?.startsWith("/superadmin/");
  const targetPath =
    requestsSuperadmin && !isSuperadmin
      ? "/library"
      : requestedPath ?? (isSuperadmin ? "/superadmin" : "/library");

  return NextResponse.redirect(new URL(targetPath, request.url));
}
