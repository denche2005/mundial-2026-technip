"use client";

import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { Target } from "lucide-react";
import { Flag } from "@/components/ui/flag";
import { TEAM_NAMES } from "@/lib/bracket/groups";
import { findGoldenBootPlayer } from "@/lib/bracket/golden-boot-players";
import { GoldenBootSelector } from "@/components/golden-boot-selector";
import { saveGoldenBootPrediction } from "@/app/app/simulador/actions";

interface Props {
  initialPlayerId: string | null;
  isLocked: boolean;
  readOnly?: boolean;
}

export function GoldenBootPicker({
  initialPlayerId,
  isLocked,
  readOnly = false,
}: Props) {
  const [playerId, setPlayerId] = useState(initialPlayerId ?? "");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const selected = findGoldenBootPlayer(playerId);
  const canEdit = !isLocked && !readOnly;

  function persist(nextPlayerId: string) {
    if (!canEdit || !nextPlayerId) return;
    setMessage("");
    startTransition(async () => {
      const result = await saveGoldenBootPrediction(nextPlayerId);
      if (result.error) setMessage(result.error);
      else setMessage("Guardado");
      setTimeout(() => setMessage(""), 2000);
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-[#0070ef]" />
        <h2 className="font-headline-lg text-headline-lg text-[#004c84]">
          Máximo goleador
        </h2>
      </div>
      <p className="text-body-md text-[#555] -mt-2">
        Elige al jugador que crees que será el pichichi del torneo. Si aciertas, sumas{" "}
        <strong className="text-[#1a1a2e]">5 puntos</strong> extra.
      </p>

      <div className="rounded-xl border border-[#dedede] bg-white p-4 shadow-sm space-y-4">
        {readOnly && selected ? (
          <div className="flex items-center gap-3">
            <Flag code={selected.team} size="md" rounded="full" />
            <div>
              <p className="font-semibold text-[#1a1a2e]">{selected.name}</p>
              <p className="text-sm text-[#878787]">{TEAM_NAMES[selected.team]}</p>
            </div>
          </div>
        ) : readOnly ? (
          <p className="text-sm text-[#878787]">Sin predicción de goleador.</p>
        ) : (
          <GoldenBootSelector
            selectedPlayerId={playerId}
            disabled={!canEdit || pending}
            onSelect={(id) => {
              setPlayerId(id);
              persist(id);
            }}
          />
        )}

        {message ? (
          <p
            className={clsx(
              "text-xs",
              message === "Guardado" ? "text-[#2d6a4f]" : "text-[#e84242]"
            )}
          >
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}

