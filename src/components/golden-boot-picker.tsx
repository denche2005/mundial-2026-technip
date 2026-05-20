"use client";

import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { Target, Pencil } from "lucide-react";
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
  const [editing, setEditing] = useState(!initialPlayerId);
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
      else {
        setMessage("Guardado");
        setEditing(false);
      }
      setTimeout(() => setMessage(""), 2000);
    });
  }

  if (readOnly) {
    return (
      <div className="rounded-xl border border-[#dedede] bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-[#555] flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[#004c84]">Máximo goleador:</span>
          {selected ? (
            <>
              <Flag code={selected.team} size="sm" rounded="full" />
              <span className="font-medium text-[#1a1a2e]">{selected.name}</span>
              <span className="text-[#878787]">({TEAM_NAMES[selected.team]})</span>
            </>
          ) : (
            <span className="text-[#878787]">No seleccionado</span>
          )}
        </p>
      </div>
    );
  }

  const showPicker = canEdit && (editing || !selected);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-[#0070ef]" />
        <h2 className="font-headline-lg text-headline-lg text-[#004c84]">
          Máximo goleador
        </h2>
      </div>

      {showPicker ? (
        <>
          <p className="text-body-md text-[#555] -mt-2">
            Elige al jugador que crees que será el máximo goleador del torneo. Si aciertas,
            sumas <strong className="text-[#1a1a2e]">5 puntos</strong> extra.
          </p>
          <div className="rounded-xl border border-[#dedede] bg-white p-4 shadow-sm space-y-4">
            <GoldenBootSelector
              selectedPlayerId={playerId}
              disabled={pending}
              onSelect={(id) => {
                setPlayerId(id);
                persist(id);
              }}
            />
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
        </>
      ) : selected ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={!canEdit}
          className="w-full rounded-xl border border-[#80c7a0]/40 bg-[#d8f5e6]/50 px-4 py-3 text-left transition hover:border-[#0070ef]/40 hover:bg-[#e0efff]/60 disabled:cursor-default"
        >
          <div className="flex items-center gap-3">
            <Flag code={selected.team} size="md" rounded="full" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-[#2d6a4f]">
                Tu elección
              </p>
              <p className="font-semibold text-[#004c84]">{selected.name}</p>
              <p className="text-xs text-[#555]">{TEAM_NAMES[selected.team]}</p>
            </div>
            {canEdit ? (
              <span className="flex items-center gap-1 text-xs font-medium text-[#0070ef] shrink-0">
                <Pencil className="h-3.5 w-3.5" />
                Cambiar
              </span>
            ) : null}
          </div>
        </button>
      ) : null}
    </section>
  );
}
