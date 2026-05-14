import { NextResponse, type NextRequest } from "next/server";

/**
 * Only the `/app/*` area requires authentication. The landing page (`/`),
 * the login page (`/login`), registration (`/register`), the OAuth callback
 * (`/auth/*`) stay open.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const base = request.nextUrl.basePath ?? "";

  /** Next puede exponer `pathname` con o sin `basePath` según versión; normalizamos. */
  let effectivePath = pathname;
  if (base && pathname.startsWith(`${base}/`)) {
    effectivePath = pathname.slice(base.length) || "/";
  } else if (base && pathname === base) {
    effectivePath = "/";
  }

  // Only protect /app routes
  if (!effectivePath.startsWith("/app")) {
    return NextResponse.next();
  }

  // Check for our custom session cookie (password login)
  const sessionCookie = request.cookies.get("session_user");
  const hasSession = !!(sessionCookie?.value);

  // Supabase SSR auth cookies vary by minor versions; accept common patterns.
  const hasSbSession = request.cookies.getAll().some((c) => {
    if (!c.name.startsWith("sb-") || !c.value) return false;
    return (
      c.name.includes("auth-token") ||
      c.name.includes("access-token") ||
      c.name.includes("refresh-token")
    );
  });

  if (!hasSession && !hasSbSession) {
    const loginUrl = new URL(`${base}/login`, request.url);
    loginUrl.searchParams.set("next", effectivePath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
