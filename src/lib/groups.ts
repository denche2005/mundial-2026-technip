import { randomBytes } from "crypto";

/**
 * Slug generator for group URLs. Lower-case, alphanumeric + dashes, deduped
 * by appending a short random suffix to keep collisions vanishingly rare.
 */
export function makeGroupSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);

  const suffix = randomBytes(3).toString("hex");
  return base ? `${base}-${suffix}` : `porra-${suffix}`;
}

/**
 * Six-character upper-case alphanumeric code (no ambiguous chars: 0/O, 1/I).
 * Easy to read out loud or send by SMS.
 */
export function makeInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/**
 * URL-safe random invite token. 24 bytes → 32 chars in base64url, plenty
 * for a non-guessable shareable link.
 */
export function makeInviteToken(): string {
  return randomBytes(24).toString("base64url");
}

export function buildInviteUrl(origin: string, token: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/g/join/${token}`;
}
