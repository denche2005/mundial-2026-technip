"use client";

import { useState, useTransition } from "react";
import { Target, Save } from "lucide-react";
import { GoldenBootSelector } from "@/components/golden-boot-selector";
import { saveGoldenBootResult } from "@/app/app/admin/bracket/actions";

export function AdminGoldenBootPanel({
  initialPlayerId,
}: {
  initialPlayerId: string | null;
}) {
  const [playerId, setPlayerId] = useState(initialPlayerId ?? "");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setError("");
    setOk("");
    startTransition(async () => {
      const result = await saveGoldenBootResult(playerId);
      if (result.error) setError(result.error);
      else setOk("Goleador oficial guardado (+5 pts a quien acierte)");
    });
  }

  return (
    <section className="rounded-xl border border-[#dedede] bg-white p-porra-md shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-[#ee7766]" />
        <h2 className="text-xl font-bold text-[#004c84]">Goleador oficial (pichichi)</h2>
      </div>
      <p className="text-sm text-[#555]">
        Fija el máximo goleador del torneo. Los usuarios que lo hayan elegido suman 5 puntos en el ranking.
      </p>

      <GoldenBootSelector
        selectedPlayerId={playerId}
        disabled={pending}
        compact
        onSelect={setPlayerId}
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={!playerId || pending}
        className="inline-flex items-center gap-2 rounded-xl bg-[#0070ef] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        Guardar goleador oficial
      </button>

      {error ? <p className="text-sm text-[#e84242]">{error}</p> : null}
      {ok ? <p className="text-sm text-[#2d6a4f]">{ok}</p> : null}
    </section>
  );
}

