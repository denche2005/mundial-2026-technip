"use client";

import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

type SaveState = "idle" | "saving" | "saved" | "error";

export function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity",
        state === "saving" && "text-on-surface-variant",
        state === "saved" && "text-tertiary",
        state === "error" && "text-error"
      )}
    >
      {state === "saving" && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Guardando…
        </>
      )}
      {state === "saved" && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Guardado
        </>
      )}
      {state === "error" && (
        <>
          <AlertCircle className="h-3.5 w-3.5" />
          Error al guardar
        </>
      )}
    </span>
  );
}
