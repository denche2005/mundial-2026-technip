"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface Props {
  groupName: string;
  inviteUrl: string;
  inviteCode: string;
  /** Layout al estilo Stitch (dashboard de grupo): bloque invitar + URL + COPY. */
  variant?: "default" | "dashboard";
}

export function GroupShareCard({
  groupName,
  inviteUrl,
  inviteCode,
  variant = "default",
}: Props) {
  const url = inviteUrl;
  const [copied, setCopied] = useState<"url" | "code" | null>(null);
  const [error, setError] = useState("");

  async function copy(text: string, kind: "url" | "code") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("No se pudo copiar");
    }
  }

  function displayUrl(u: string) {
    if (!u) return "";
    try {
      const parsed = new URL(u);
      return `${parsed.host}${parsed.pathname}`;
    } catch {
      return u;
    }
  }

  async function handleShare() {
    const shareData = {
      title: `Únete a "${groupName}"`,
      text: `Te invito a la porra del Mundial 2026 (${groupName}). Predice resultados y compite con nosotros:`,
      url,
    };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share API not available — fall back to copy.
      }
    }
    await copy(url, "url");
  }

  if (variant === "dashboard") {
    return (
      <section className="glass-panel rounded-xl border border-secondary/20 p-porra-lg space-y-porra-md">
        <div className="flex flex-col gap-porra-lg lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-row items-start gap-porra-md min-w-0 flex-1 lg:max-w-[min(100%,28rem)]">
            <button
              type="button"
              onClick={handleShare}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/15 active:scale-95 transition-transform"
              aria-label="Compartir invitación"
            >
              <Share2 className="h-6 w-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Invita a más amigos
              </h3>
              <p className="text-on-surface-variant text-sm mt-1 text-pretty">
                Amplía la liga y suma rivales. Comparte el enlace o copia el código.
              </p>
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-porra-sm lg:w-auto lg:max-w-xl lg:shrink-0">
            <div className="flex items-stretch rounded-lg border border-white/10 bg-surface-container-lowest/50 p-1 gap-1 min-w-0">
              <span
                className="flex-1 min-w-0 px-porra-md py-porra-sm font-data-mono text-data-mono text-on-primary-container truncate self-center"
                title={url || undefined}
              >
                {url ? displayUrl(url) : "— Sin enlace activo —"}
              </span>
              <button
                type="button"
                onClick={() => url && copy(url, "url")}
                disabled={!url}
                className="shrink-0 rounded-md bg-secondary px-porra-lg py-porra-sm font-label-caps text-label-caps text-on-secondary hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {copied === "url" ? "LISTO" : "COPIAR"}
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-porra-sm text-xs text-on-surface-variant">
              <span>
                Código:{" "}
                <span className="font-data-mono text-on-surface tracking-widest">
                  {inviteCode}
                </span>
              </span>
              <button
                type="button"
                onClick={() => copy(inviteCode, "code")}
                className="font-label-caps text-label-caps text-secondary hover:underline"
              >
                {copied === "code" ? "Copiado" : "Copiar código"}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-error">{error}</p>}
      </section>
    );
  }

  return (
    <div className="rounded-md border border-outline-variant bg-surface-container p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-on-surface">
            Invita a tus amigos
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            Comparte el link o el código corto. Quien entre se une al grupo
            automáticamente.
          </p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-on-secondary"
        >
          <Share2 className="h-3.5 w-3.5" />
          Compartir
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-on-surface-variant">
            Link de invitación
          </label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={url}
              className="w-full truncate rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 text-xs font-mono text-on-surface"
            />
            <button
              type="button"
              onClick={() => copy(url, "url")}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-outline px-3 py-2 text-xs font-semibold text-on-surface"
            >
              {copied === "url" ? (
                <Check className="h-3.5 w-3.5 text-tertiary" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied === "url" ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-on-surface-variant">
            Código corto (6 caracteres)
          </label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={inviteCode}
              className="w-full rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 text-center text-sm font-bold tracking-widest text-on-surface sm:w-32"
            />
            <button
              type="button"
              onClick={() => copy(inviteCode, "code")}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-outline px-3 py-2 text-xs font-semibold text-on-surface"
            >
              {copied === "code" ? (
                <Check className="h-3.5 w-3.5 text-tertiary" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied === "code" ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    </div>
  );
}
