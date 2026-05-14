import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * OAuth callback handler. Supabase Auth redirects here after a successful
 * social login (Google, Apple, etc.) with a one-time `code` we exchange for
 * a session. After the exchange we ensure a row exists in `profiles` linked
 * via `auth_user_id`, then set the session cookie directly on the redirect
 * response (NOT via cookies() which doesn't attach to redirect responses).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
    );
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  const service = createServiceClient();

  const fullName =
    (authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined) ??
    "";
  const avatarUrl =
    (authUser.user_metadata?.avatar_url as string | undefined) ??
    (authUser.user_metadata?.picture as string | undefined) ??
    null;

  const { data: profileId, error: rpcError } = await service.rpc(
    "upsert_profile_for_auth_user",
    {
      p_auth_user_id: authUser.id,
      p_email: authUser.email ?? null,
      p_full_name: fullName,
      p_avatar_url: avatarUrl,
    }
  );

  if (rpcError || !profileId) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(rpcError?.message ?? "profile")}`,
        request.url
      )
    );
  }

  // CRITICAL FIX: Set the session cookie directly on the NextResponse object.
  // Using cookies() from next/headers here does NOT work for redirect responses
  // in Next.js 15 — the Set-Cookie header is only attached to non-redirect responses.
  const redirectUrl = new URL(next.startsWith("/") ? next : "/app", request.url);
  const response = NextResponse.redirect(redirectUrl);

  const isSecure = process.env.NODE_ENV === "production" 
    ? (process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https://") 
    : false;
  const cookieOptions = [
    `session_user=${profileId as string}`,
    `Path=/`,
    `Max-Age=${60 * 60 * 24 * 90}`,
    `SameSite=Lax`,
    `HttpOnly`,
    ...(isSecure ? ["Secure"] : []),
  ].join("; ");

  response.headers.append("Set-Cookie", cookieOptions);

  return response;
}
