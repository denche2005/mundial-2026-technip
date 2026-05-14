import type { LeaderboardEntry } from "@/lib/types";

/** Solo puntos de cuadro (sin partidos). */
export function RankingPointsBreakdown({ entry }: { entry: LeaderboardEntry }) {
  const pts = entry.bracket_points ?? 0;
  return (
    <div className="mt-2">
      <span className="inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-secondary/12 px-2.5 py-1 font-data-mono text-[10px] text-secondary">
        Cuadro
        <span className="font-bold tabular-nums">{pts}</span>
      </span>
    </div>
  );
}
