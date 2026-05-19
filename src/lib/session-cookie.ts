import { headers } from "next/headers";

function protoIsHttps(proto: string | null): boolean {
  if (!proto) return false;
  return proto.split(",")[0].trim().toLowerCase() === "https";
}

function hostIsLocal(host: string): boolean {
  const h = host.toLowerCase().split(":")[0];
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h.endsWith(".local");
}

/** `Secure` cookie flag for server actions (uses incoming request headers). */
export async function isSessionCookieSecure(): Promise<boolean> {
  const h = await headers();
  if (protoIsHttps(h.get("x-forwarded-proto"))) return true;
  const host = h.get("host") ?? "";
  if (hostIsLocal(host)) return false;
  if (process.env.NODE_ENV !== "production") return false;
  return (process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https://");
}

/** `Secure` cookie flag for route handlers (`Request` available). */
export function isSessionCookieSecureFromRequest(request: Request): boolean {
  if (protoIsHttps(request.headers.get("x-forwarded-proto"))) return true;
  const url = new URL(request.url);
  if (hostIsLocal(url.host)) return false;
  if (process.env.NODE_ENV !== "production") return false;
  return url.protocol === "https:";
}
