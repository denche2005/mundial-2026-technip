"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function GroupCreatedActions({
  inviteCode,
}: {
  inviteCode: string;
}) {
  const [copied, setCopied] = useState<boolean>(false);

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => copyText(inviteCode)}
        className="flex items-center gap-sm bg-secondary text-on-secondary px-lg py-sm rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "¡Copiado!" : "Copiar código"}
      </button>
    </>
  );
}
