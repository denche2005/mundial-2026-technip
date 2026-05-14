/**
 * Subpath public URL prefix when the app is hosted under a folder (e.g. IIS
 * `https://host/zip_mundial/`). Set `NEXT_PUBLIC_BASE_PATH=/zip_mundial` at
 * build time; leave unset for local root `http://localhost:3000/`.
 */
export function getPublicBasePath(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/$/, "");
  if (!raw) return "";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

/** Prefix an internal path (`/app`, `/login`) for full browser navigation. */
export function withPublicBasePath(path: string): string {
  const base = getPublicBasePath();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Cookie `Path` attribute: isolate session to the subpath when set. */
export function cookiePathForApp(): string {
  return getPublicBasePath() || "/";
}
