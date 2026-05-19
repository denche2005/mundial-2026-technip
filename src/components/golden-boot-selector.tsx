"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { Search } from "lucide-react";
import { Flag } from "@/components/ui/flag";
import { TEAM_NAMES } from "@/lib/bracket/groups";
import {
  findGoldenBootPlayer,
  goldenBootPlayersByTeam,
  GOLDEN_BOOT_TEAM_OPTIONS,
  type GoldenBootPlayer,
} from "@/lib/bracket/golden-boot-players";

interface Props {
  selectedPlayerId: string;
  onSelect: (playerId: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function GoldenBootSelector({
  selectedPlayerId,
  onSelect,
  disabled = false,
  compact = false,
}: Props) {
  const initial = findGoldenBootPlayer(selectedPlayerId);
  const [team, setTeam] = useState(initial?.team ?? "");
  const [query, setQuery] = useState("");

  const players = useMemo(() => {
    const list = team ? goldenBootPlayersByTeam(team) : [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => p.name.toLowerCase().includes(q));
  }, [team, query]);

  const selected = findGoldenBootPlayer(selectedPlayerId);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[10px] font-bold tracking-widest text-[#878787] uppercase">
          1. Elige selección
        </p>
        <div
          className={clsx(
            "grid gap-2",
            compact ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-6"
          )}
        >
          {GOLDEN_BOOT_TEAM_OPTIONS.map((code) => {
            const active = team === code;
            return (
              <button
                key={code}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setTeam(code);
                  setQuery("");
                }}
                title={TEAM_NAMES[code] ?? code}
                className={clsx(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all",
                  active
                    ? "border-[#0070ef] bg-[#e0efff] shadow-sm ring-2 ring-[#0070ef]/25"
                    : "border-[#dedede] bg-[#f8f9fa] hover:border-[#0070ef]/40 hover:bg-white",
                  disabled && "opacity-60 cursor-not-allowed"
                )}
              >
                <Flag code={code} size="md" rounded="full" />
                <span
                  className={clsx(
                    "text-[10px] font-bold leading-tight text-center",
                    active ? "text-[#004c84]" : "text-[#555]"
                  )}
                >
                  {code}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {team ? (
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-widest text-[#878787] uppercase">
            2. Elige jugador — {TEAM_NAMES[team]}
          </p>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#878787]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={disabled}
              placeholder="Buscar en la plantilla…"
              className="w-full rounded-xl border border-[#dedede] bg-[#f8f9fa] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0070ef] focus:ring-2 focus:ring-[#0070ef]/20 disabled:opacity-60"
            />
          </div>
          <PlayerGrid
            players={players}
            selectedId={selectedPlayerId}
            disabled={disabled}
            onSelect={onSelect}
          />
          <p className="mt-2 text-xs text-[#878787]">
            {players.length} jugadores en plantilla
            {query ? ` (filtrado)` : ""}
          </p>
        </div>
      ) : (
        <p className="text-sm text-[#878787] rounded-xl border border-dashed border-[#dedede] bg-[#f8f9fa] p-4 text-center">
          Primero elige un país con la bandera.
        </p>
      )}

      {selected ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#80c7a0]/40 bg-[#d8f5e6]/50 px-4 py-3">
          <Flag code={selected.team} size="md" rounded="full" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#2d6a4f]">
              Tu elección
            </p>
            <p className="font-semibold text-[#004c84]">{selected.name}</p>
            <p className="text-xs text-[#555]">{TEAM_NAMES[selected.team]}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PlayerGrid({
  players,
  selectedId,
  disabled,
  onSelect,
}: {
  players: GoldenBootPlayer[];
  selectedId: string;
  disabled: boolean;
  onSelect: (id: string) => void;
}) {
  if (players.length === 0) {
    return (
      <p className="text-sm text-[#878787] py-6 text-center">No hay jugadores que coincidan.</p>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto rounded-xl border border-[#dedede] bg-white p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
      {players.map((p) => {
        const active = p.id === selectedId;
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(p.id)}
            className={clsx(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
              active
                ? "bg-[#0070ef] text-white"
                : "text-[#1a1a2e] hover:bg-[#f0f6ff]"
            )}
          >
            <Flag code={p.team} size="sm" rounded="full" className="shrink-0" />
            <span className="truncate font-medium">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}

