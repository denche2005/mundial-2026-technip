/**
 * Safe in-app redirect target after login/register (open redirect hardening).
 */
export function sanitizeInternalPath(next: string | null | undefined): string {
  if (!next || typeof next !== "string") return "/app";
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/app";
  if (t.includes("..") || t.includes("\\")) return "/app";
  return t;
}
