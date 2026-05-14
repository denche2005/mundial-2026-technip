"use client";

import { clsx } from "clsx";

export interface GroupLeaderboardEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  exact_results: number;
  tendency_results: number;
  bracket_points: number;
}

export function GroupLeaderboard({
  entries,
}: {
  entries: GroupLeaderboardEntry[];
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-outline-variant bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
        Aún no hay puntuaciones. Aparecerán cuando se completen los primeros
        partidos.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-outline-variant bg-surface-container">
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
          {entries.map((e, i) => (
            <tr
              key={e.user_id}
              className={clsx(
                "border-b border-outline-variant/60 last:border-0",
                i === 0 && "bg-secondary/10"
              )}
            >
              <td className="px-3 py-2 text-center text-xs font-semibold text-on-surface-variant">
                {i + 1}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-xs font-semibold text-on-surface">
                    {e.full_name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <span className="truncate text-sm font-medium text-on-surface">
                    {e.full_name ?? "Anónimo"}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-center text-xs text-on-surface-variant tabular-nums">
                {e.exact_results}
              </td>
              <td className="px-3 py-2 text-center text-xs text-on-surface-variant tabular-nums">
                {e.tendency_results}
              </td>
              <td className="px-3 py-2 text-center text-xs text-on-surface-variant tabular-nums">
                {e.bracket_points}
              </td>
              <td className="px-3 py-2 text-right text-sm font-bold text-on-surface tabular-nums">
                {e.total_points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
