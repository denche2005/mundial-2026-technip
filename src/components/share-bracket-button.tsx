"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { BRACKET_CAPTURE_WIDTH_PX } from "@/lib/bracket/bracket-layout";

interface ShareBracketButtonProps {
  captureRef: React.RefObject<HTMLDivElement | null>;
  userName: string;
}

export function ShareBracketButton({ captureRef, userName }: ShareBracketButtonProps) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  function buildPngOptions(pixelRatio: number) {
    return {
      cacheBust: true,
      pixelRatio,
      backgroundColor: "#f0f2f5",
      fetchRequestInit: { mode: "cors" as RequestMode, cache: "no-cache" as RequestCache },
      onclone: (cloned: Document) => {
        const cap = cloned.querySelector<HTMLElement>("[data-bracket-capture]");
        if (cap) {
          cap.style.transform = "none";
          cap.style.position = "static";
          cap.style.width = `${BRACKET_CAPTURE_WIDTH_PX}px`;
        }
        cloned.querySelectorAll<HTMLElement>("*").forEach((el) => {
          const s = cloned.defaultView?.getComputedStyle(el);
          if (!s) return;
          if (s.backdropFilter && s.backdropFilter !== "none") {
            el.style.backdropFilter = "none";
          }
          const webkitBf = s.getPropertyValue("-webkit-backdrop-filter");
          if (webkitBf && webkitBf !== "none") {
            el.style.setProperty("-webkit-backdrop-filter", "none");
          }
        });
      },
    };
  }

  async function generatePng(): Promise<string | null> {
    const target = captureRef.current;
    if (!target) return null;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const pixelRatio = Math.min(4, Math.max(3, dpr * 1.35));
    const opts = buildPngOptions(pixelRatio);

    await toPng(target, opts).catch(() => null);

    try {
      return await toPng(target, opts);
    } catch (e) {
      console.error("[ShareBracket] toPng failed", e);
      return null;
    }
  }

  function dataUrlToFile(dataUrl: string, filename: string): File | null {
    const parts = dataUrl.split(",");
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/data:(.*?);base64/);
    const mime = mimeMatch?.[1] ?? "image/png";
    try {
      const binary = atob(parts[1]);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new File([bytes], filename, { type: mime });
    } catch {
      return null;
    }
  }

  async function handleShare() {
    try {
      setLoading(true);
      setToast("");

      const dataUrl = await generatePng();
      if (!dataUrl) {
        setToast("No se pudo generar la imagen.");
        return;
      }

      const file = dataUrlToFile(dataUrl, "mi-bracket-mundial-2026.png");

      if (
        file &&
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        "canShare" in navigator &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Mi cuadro del Mundial 2026",
          text: `${userName} — Mi camino a la final`,
        });
        return;
      }

      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = "mi-bracket-mundial-2026.png";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setToast("¡PNG descargado!");
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("AbortError") || msg.includes("cancel")) return;
      setToast("Error al generar imagen.");
      setTimeout(() => setToast(""), 2500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center px-4 pt-2 pointer-events-auto">
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0070ef] px-6 py-3 text-white font-bold shadow-[0_4px_12px_rgba(0,112,239,0.25)] transition hover:brightness-105 disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Generando imagen…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Compartir mi cuadro
            </>
          )}
        </button>

        {toast && (
          <p className="rounded-lg bg-white px-4 py-1.5 text-xs text-[#1a1a2e] border border-[#dedede] shadow">
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}
