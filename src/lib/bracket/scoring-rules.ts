/** Puntos por acierto (coincide con `bracket_round_points` en Supabase). */
export const BRACKET_SCORING_ROWS = [
  { round: "Dieciseisavos (1/16)", pts: 1, count: 32 },
  { round: "Octavos (1/8)", pts: 2, count: 16 },
  { round: "Cuartos (1/4)", pts: 3, count: 8 },
  { round: "Semifinal (1/2)", pts: 4, count: 4 },
  { round: "Final", pts: 5, count: 2 },
  { round: "Campeón", pts: 10, count: 1 },
] as const;

export function bracketScoringBadgeClass(pts: number): string {
  if (pts >= 10) return "bg-[#e0efff] text-[#0070ef]";
  if (pts >= 4) return "bg-[#d8f5e6] text-[#2d6a4f]";
  return "bg-[#f0f2f5] text-[#555]";
}
