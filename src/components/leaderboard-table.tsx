"use client";

import { clsx } from "clsx";
import type { LeaderboardEntry } from "@/lib/types";

interface Props {
  entries: LeaderboardEntry[];
  startRank?: number;
}

export function LeaderboardTable({ entries, startRank = 1 }: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-outline-variant bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
        Aún no hay puntuaciones. Aparecerán cuando se completen los primeros
        partidos.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {entries.map((entry, i) => {
          const rank = startRank + i;
          return (
            <article
              key={entry.user_id}
              className={clsx(
                "rounded-md border bg-surface-container px-3 py-3",
                rank <= 3 ? "border-secondary/50" : "border-outline-variant"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-6 text-sm font-semibold tabular-nums text-on-surface-variant">
                    #{rank}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-xs font-semibold text-on-surface">
                    {entry.full_name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {entry.full_name}
                  </p>
                </div>
                <p className="text-base font-bold tabular-nums text-on-surface">
                  {entry.total_points}
                </p>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs text-on-surface-variant">
                <p>Exa {entry.exact_results}</p>
                <p>Ten {entry.tendency_results}</p>
                <p>Brk {entry.bracket_points}</p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="hidden overflow-hidden rounded-md border border-outline-variant bg-surface-container md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-outline-variant bg-surface-container-high text-xs font-medium text-on-surface-variant">
            <tr>
              <th className="w-10 px-3 py-2 text-center">#</th>
              <th className="px-3 py-2 text-left">Participante</th>
              <th className="w-12 px-3 py-2 text-center">Exa</th>
              <th className="w-12 px-3 py-2 text-center">Ten</th>
              <th className="w-12 px-3 py-2 text-center">Brk</th>
              <th className="w-16 px-3 py-2 text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const rank = startRank + i;
              return (
              <tr
                key={entry.user_id}
                className={clsx(
                  "border-b border-outline-variant/60 last:border-0",
                  rank <= 3 && "bg-secondary/10"
                )}
              >
                <td className="px-3 py-2 text-center">
                  <span
                    className={clsx(
                      "text-xs font-bold",
                      rank === 1 && "text-secondary",
                      rank === 2 && "text-on-surface-variant",
                      rank === 3 && "text-tertiary",
                      rank > 3 && "text-on-surface-variant"
                    )}
                  >
                    {rank}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-xs font-semibold text-on-surface">
                      {entry.full_name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <span className="truncate text-sm font-medium text-on-surface">
                      {entry.full_name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-center text-xs text-on-surface-variant tabular-nums">
                  {entry.exact_results}
                </td>
                <td className="px-3 py-2 text-center text-xs text-on-surface-variant tabular-nums">
                  {entry.tendency_results}
                </td>
                <td className="px-3 py-2 text-center text-xs text-on-surface-variant tabular-nums">
                  {entry.bracket_points}
                </td>
                <td className="px-3 py-2 text-right text-sm font-bold text-on-surface tabular-nums">
                  {entry.total_points}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-center text-[11px] text-on-surface-variant">
        Exa = Marcador exacto (3 pts) · Ten = Tendencia (1 pt) · Brk = Aciertos de bracket
      </p>
    </div>
  );
}
