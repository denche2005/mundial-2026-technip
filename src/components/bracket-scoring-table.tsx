import {
  BRACKET_SCORING_ROWS,
  bracketScoringBadgeClass,
} from "@/lib/bracket/scoring-rules";

export function BracketScoringTable() {
  return (
    <div className="rounded-2xl border border-[#dedede] bg-white overflow-hidden shadow-sm">
      <div className="grid grid-cols-3 gap-0 border-b border-[#dedede] bg-[#f8f9fa] px-4 py-3 sm:px-6 text-[10px] font-bold tracking-widest text-[#878787] uppercase">
        <span>Ronda</span>
        <span className="text-center">Equipos</span>
        <span className="text-right">Puntos por acierto</span>
      </div>
      {BRACKET_SCORING_ROWS.map((rule, idx) => (
        <div
          key={rule.round}
          className={`grid grid-cols-3 gap-0 px-4 py-3.5 sm:px-6 sm:py-4 items-center ${
            idx < BRACKET_SCORING_ROWS.length - 1 ? "border-b border-[#f0f2f5]" : ""
          }`}
        >
          <span className="font-semibold text-xs sm:text-sm text-[#1a1a2e] pr-2 min-w-0 leading-snug">
            {rule.round}
          </span>
          <span className="text-center text-xs sm:text-sm text-[#555] tabular-nums">
            {rule.count}
          </span>
          <span className="text-right">
            <span
              className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs sm:text-sm font-bold tabular-nums ${bracketScoringBadgeClass(rule.pts)}`}
            >
              {rule.pts} pt{rule.pts > 1 ? "s" : ""}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
