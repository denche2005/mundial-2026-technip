"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Lock, CheckCircle2, Trophy } from "lucide-react";
import { clsx } from "clsx";
import type { BracketPrediction } from "@/lib/types";
import { WORLD_CUP_GROUPS, TEAM_NAMES, TEAM_SHORT } from "@/lib/bracket/groups";
import {
  generateFullBracket,
  type GroupStanding,
  type KnockoutMatch,
} from "@/lib/bracket/generateKnockout";
import { pruneBestThirds, pruneKnockoutPicks } from "@/lib/bracket/stableThirds";
import { saveBracketPredictions } from "@/app/app/simulador/actions";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { Flag } from "@/components/ui/flag";
import { ShareBracketButton } from "@/components/share-bracket-button";
import { BRACKET_CAPTURE_WIDTH_PX } from "@/lib/bracket/bracket-layout";

type SaveState = "idle" | "saving" | "saved" | "error";

const BRACKET_CAPTURE_MIN_H = 860;

function shortSiteHost(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "";
  try {
    return new URL(raw).host.replace(/^www\./, "");
  } catch {
    return raw
      .replace(/^https?:\/\//i, "")
      .split("/")[0]
      ?.slice(0, 48) ?? "";
  }
}

interface Props {
  predictions: BracketPrediction[];
  isLocked: boolean;
  userName?: string;
}

function buildInitialState(predictions: BracketPrediction[]) {
  const standings: Record<string, string[]> = {};
  WORLD_CUP_GROUPS.forEach((g) => {
    standings[g.code] = [];
  });
  const picks: Record<string, string> = {};
  const bestThirdsByIndex: Record<number, string> = {};

  for (const p of predictions) {
    if (p.round === "r32") {
      if (p.position >= 1 && p.position <= 48) {
        const groupIdx = Math.floor((p.position - 1) / 4);
        const slotIdx = (p.position - 1) % 4;
        const groupCode = WORLD_CUP_GROUPS[groupIdx]?.code;
        if (groupCode && slotIdx < 3) standings[groupCode][slotIdx] = p.team;
      }
      if (p.position >= 101 && p.position <= 116) {
        picks[`r32-${p.position - 100}`] = p.team;
      }
      if (p.position >= 1000 && p.position <= 1007) {
        bestThirdsByIndex[p.position - 1000] = p.team;
      }
    }

    if (p.round === "r16" || p.round === "qf" || p.round === "sf" || p.round === "final") {
      if (p.position >= 101) picks[`${p.round}-${p.position - 100}`] = p.team;
    }

    if (p.round === "champion" && p.position === 1 && p.team) {
      picks["final-1"] = p.team;
    }
  }

  Object.keys(standings).forEach((code) => {
    standings[code] = standings[code].filter(Boolean);
  });

  const bestThirds = Object.keys(bestThirdsByIndex)
    .map(Number)
    .sort((a, b) => a - b)
    .map((idx) => bestThirdsByIndex[idx]);

  return { standings, bestThirds, picks };
}

function eliminatedTeam(groupCode: string, selected: string[]): string | null {
  if (selected.length < 3) return null;
  const teams = WORLD_CUP_GROUPS.find((g) => g.code === groupCode)?.teams ?? [];
  return teams.find((t) => !selected.includes(t)) ?? null;
}

function predictionsSignature(rows: BracketPrediction[]) {
  return rows
    .map((p) => `${p.round}:${p.position}:${p.team}`)
    .sort()
    .join("|");
}

export function BracketSimulator({ predictions, isLocked, userName = "Jugador" }: Props) {
  const initial = useMemo(() => buildInitialState(predictions), [predictions]);
  const [standings, setStandings] = useState<Record<string, string[]>>(initial.standings);
  const [bestThirds, setBestThirds] = useState<string[]>(initial.bestThirds);
  const [picks, setPicks] = useState<Record<string, string>>(initial.picks);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const userDirtyRef = useRef(false);

  const predictionsKey = useMemo(
    () => predictionsSignature(predictions),
    [predictions]
  );

  useEffect(() => {
    if (userDirtyRef.current) return;
    const next = buildInitialState(predictions);
    setStandings(next.standings);
    setBestThirds(next.bestThirds);
    setPicks(next.picks);
  }, [predictionsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const captureRef = useRef<HTMLDivElement | null>(null);
  const bracketViewportRef = useRef<HTMLDivElement | null>(null);
  const [bracketScale, setBracketScale] = useState(1);
  const [bracketCaptureH, setBracketCaptureH] = useState(BRACKET_CAPTURE_MIN_H);

  const allThirds = useMemo(
    () =>
      Object.entries(standings)
        .filter(([, arr]) => arr.length >= 3)
        .map(([group, arr]) => ({ group, team: arr[2] })),
    [standings]
  );

  const bracket = useMemo(() => {
    const complete = Object.values(standings).filter((arr) => arr.length >= 2);
    if (complete.length < 12) return null;
    const groupStandings: GroupStanding[] = Object.entries(standings)
      .filter(([, arr]) => arr.length >= 2)
      .map(([groupCode, arr]) => ({
        groupCode,
        first: arr[0],
        second: arr[1],
        third: arr[2] ?? "",
      }));
    return generateFullBracket(groupStandings, bestThirds, picks);
  }, [standings, bestThirds, picks]);

  const [mobileNaturalBracketSize, setMobileNaturalBracketSize] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobileNaturalBracketSize(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const outer = bracketViewportRef.current;
    const cap = captureRef.current;
    if (!outer || !cap) return;
    const MIN_SCALE = 0.28;
    const measure = () => {
      if (mobileNaturalBracketSize) {
        setBracketScale(1);
      } else {
        const avail = outer.clientWidth;
        const need = Math.max(cap.scrollWidth, 1);
        if (avail) {
          const raw = avail / need;
          setBracketScale(Math.min(1, Math.max(MIN_SCALE, raw)));
        }
      }
      setBracketCaptureH(
        Math.max(BRACKET_CAPTURE_MIN_H, Math.ceil(cap.scrollHeight))
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    ro.observe(cap);
    return () => ro.disconnect();
  }, [bracket, picks, bestThirds, standings, mobileNaturalBracketSize]);

  const persist = useCallback(async () => {
    if (isLocked) return;
    const payload: { round: string; position: number; team: string }[] = [];

    Object.entries(standings).forEach(([, arr], groupIndex) => {
      arr.forEach((team, slot) => {
        payload.push({ round: "r32", position: groupIndex * 4 + slot + 1, team });
      });
    });
    bestThirds.forEach((team, idx) => {
      payload.push({ round: "r32", position: 1000 + idx, team });
    });

    if (bracket) {
      [
        { round: "r32", matches: bracket.r32 },
        { round: "r16", matches: bracket.r16 },
        { round: "qf", matches: bracket.qf },
        { round: "sf", matches: bracket.sf },
        { round: "final", matches: bracket.final },
      ].forEach(({ round, matches }) => {
        matches.forEach((m) => {
          const w = picks[m.id] ?? m.winner;
          if (w) payload.push({ round, position: m.position + 100, team: w });
        });
      });
      const finalM = bracket.final[0];
      const champ = finalM ? picks[finalM.id] ?? finalM.winner : null;
      if (champ) {
        payload.push({ round: "champion", position: 1, team: champ });
      }
    }

    if (payload.length === 0) return;
    setSaveState("saving");
    const result = await saveBracketPredictions(payload);
    setSaveState(result.error ? "error" : "saved");
    if (!result.error) {
      setTimeout(() => setSaveState("idle"), 1500);
    }
  }, [isLocked, standings, bestThirds, bracket, picks]);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const hasAny = Object.values(standings).some((s) => s.length > 0);
    if (!hasAny) return;
    saveTimeoutRef.current = setTimeout(persist, 1200);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [standings, bestThirds, picks, persist]);

  const thirdSignature = useMemo(
    () =>
      Object.entries(standings)
        .filter(([, arr]) => arr.length >= 3)
        .map(([group, arr]) => `${group}:${arr[2]}`)
        .join("|"),
    [standings]
  );

  useEffect(() => {
    let prunedThirds: string[] | null = null;
    setBestThirds((prev) => {
      const next = pruneBestThirds(standings, prev);
      prunedThirds = next;
      if (JSON.stringify(next) === JSON.stringify(prev)) return prev;
      return next;
    });
    setPicks((prev) => {
      const thirds = prunedThirds ?? bestThirds;
      const next = pruneKnockoutPicks(standings, thirds, prev);
      if (JSON.stringify(next) === JSON.stringify(prev)) return prev;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thirdSignature]);

  const toggleTeamInGroup = useCallback(
    (groupCode: string, team: string) => {
      if (isLocked) return;
      userDirtyRef.current = true;
      setStandings((prev) => {
        const current = [...(prev[groupCode] ?? [])];
        const idx = current.indexOf(team);
        if (idx !== -1) {
          current.splice(idx, 1);
          return { ...prev, [groupCode]: current };
        }
        if (current.length >= 3) return prev;
        return { ...prev, [groupCode]: [...current, team] };
      });
    },
    [isLocked]
  );

  const pickWinner = useCallback(
    (matchId: string, team: string) => {
      if (isLocked) return;
      userDirtyRef.current = true;
      setPicks((prev) => ({ ...prev, [matchId]: team }));
    },
    [isLocked]
  );

  const isComplete = useMemo(() => {
    if (!bracket) return false;
    const finalMatch = bracket.final[0];
    if (!finalMatch) return false;
    return !!(picks[finalMatch.id] ?? finalMatch.winner);
  }, [bracket, picks]);

  const siteHost = shortSiteHost();

  return (
    <div className="space-y-8">
      {isLocked && (
        <div className="rounded-xl border border-[#dedede] bg-white p-3 text-[#555] font-body-md flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Bracket bloqueado: el torneo ya comenzó.
        </div>
      )}

      <div className="flex justify-end">
        <SaveIndicator state={saveState} />
      </div>

      <section className="space-y-4">
        <h2 className="font-headline-lg text-headline-lg text-[#004c84]">Fase de grupos</h2>
        <p className="text-body-md text-[#555] -mt-2">
          Marca los 3 primeros de cada grupo. El 4º se rellena automáticamente
          con el equipo eliminado.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {WORLD_CUP_GROUPS.map((group) => {
            const selected = standings[group.code] ?? [];
            const fourth = eliminatedTeam(group.code, selected);
            const groupFillCount =
              selected.length < 3 ? selected.length : fourth ? 4 : 3;
            return (
              <div key={group.code} className="rounded-xl border border-[#dedede] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-headline-sm text-headline-sm text-[#0070ef]">
                    Grupo {group.code}
                  </h3>
                  <span className="text-label-caps text-[#878787]">
                    {groupFillCount}/4
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {group.teams.map((team) => {
                    const isSelected = selected.includes(team) || (selected.length === 3 && team === fourth);
                    return (
                      <button
                        key={team}
                        type="button"
                        onClick={() => toggleTeamInGroup(group.code, team)}
                        disabled={isLocked}
                        className={clsx(
                          "rounded-lg px-2 py-2 text-left border transition-colors duration-150 flex items-center gap-2",
                          isSelected
                            ? "border-[#0070ef] bg-[#e0efff] text-[#004c84]"
                            : "border-[#dedede] bg-[#f8f9fa] text-[#555] hover:border-[#0070ef]/40 hover:bg-[#e0efff]/30"
                        )}
                      >
                        <Flag code={team} size="sm" />
                        <span className="font-body-md text-body-md">{TEAM_SHORT[team]}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  {[0, 1, 2, 3].map((slot) => {
                    const team = slot < 3 ? selected[slot] : fourth;
                    const isAuto = slot === 3;
                    const isFilled = Boolean(team);
                    return (
                      <div
                        key={slot}
                        className={clsx(
                          "rounded-lg border px-3 py-2 flex items-center gap-2 min-h-10",
                          isFilled
                            ? "border-[#dedede] bg-[#f0f2f5]"
                            : isAuto
                              ? "border-dashed border-[#dedede] bg-[#f8f9fa]"
                              : "border-[#dedede] bg-[#f8f9fa]"
                        )}
                      >
                        <span className="font-data-mono text-data-mono w-4 text-[#878787]">
                          {slot + 1}
                        </span>
                        {isFilled ? (
                          <>
                            <Flag code={team!} size="sm" />
                            <span className="font-body-md text-body-md text-[#1a1a2e]">
                              {TEAM_NAMES[team!]}
                            </span>
                          </>
                        ) : (
                          <span className="text-[#878787] text-sm">&nbsp;</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-lg text-headline-lg text-[#004c84]">Mejores terceros</h2>
        <div className="rounded-xl border border-[#dedede] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {allThirds.map(({ group, team }) => {
              const active = bestThirds.includes(team);
              return (
                <button
                  key={`${group}-${team}`}
                  type="button"
                  onClick={() =>
                    setBestThirds((prev) => {
                      userDirtyRef.current = true;
                      return prev.includes(team)
                        ? prev.filter((t) => t !== team)
                        : prev.length < 8
                          ? [...prev, team]
                          : prev;
                    })
                  }
                  disabled={isLocked}
                  className={clsx(
                    "rounded-full px-3 py-1.5 border text-sm flex items-center gap-2 transition-colors duration-150",
                    active
                      ? "bg-[#d8f5e6] border-[#80c7a0] text-[#2d6a4f]"
                      : "bg-[#f8f9fa] border-[#dedede] text-[#555] hover:border-[#80c7a0]/40"
                  )}
                >
                  <Flag code={team} size="sm" rounded="full" />
                  {TEAM_SHORT[team]} · G{group}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-label-caps text-[#878787]">
            Seleccionados: {bestThirds.length}/8
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-lg text-headline-lg text-[#004c84]">Camino a la final</h2>

        {!bracket ? (
          <p className="mx-auto max-w-xl px-2 text-center text-sm leading-relaxed text-[#555] sm:px-0 sm:text-left">
            Completa 1º y 2º en cada grupo para generar el cuadro.
          </p>
        ) : (
        <div className="rounded-2xl border border-[#dedede] bg-white p-3 md:p-5 w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain shadow-sm">
          <div
            ref={bracketViewportRef}
            className="relative flex min-w-0 w-full max-w-full justify-center"
            style={{
              minHeight: bracketCaptureH * bracketScale,
            }}
          >
            <div
              className="relative mx-auto shrink-0"
              style={{
                width: BRACKET_CAPTURE_WIDTH_PX * bracketScale,
                height: bracketCaptureH * bracketScale,
              }}
            >
              <div
                ref={captureRef}
                data-bracket-capture=""
                className="absolute left-0 top-0 box-border bg-[#f0f2f5] rounded-xl p-3 md:p-5"
                style={{
                  width: BRACKET_CAPTURE_WIDTH_PX,
                  transform: `scale(${bracketScale})`,
                  transformOrigin: "top left",
                }}
              >
            <div className="flex items-center justify-between mb-4">
              <p className="text-label-caps text-[#0070ef] tracking-widest">MUNDIAL 2026</p>
              <p className="text-label-caps text-[#878787]">{userName}</p>
            </div>

            <MirroredBracket
              bracket={bracket}
              picks={picks}
              onPick={pickWinner}
              locked={isLocked}
            />

            <div className="mt-4 flex flex-col gap-1 border-t border-[#dedede] pt-3 text-[10px] text-[#878787] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="min-w-0 truncate text-center sm:flex-1 sm:text-left">
                {userName}
              </span>
              {siteHost ? (
                <span className="min-w-0 truncate text-center font-data-mono opacity-75 sm:max-w-[45%] sm:text-right">
                  {siteHost}
                </span>
              ) : null}
            </div>
          </div>
            </div>
          </div>
        </div>
        )}
      </section>

      {isComplete && (
        <div className="pb-24">
          <ShareBracketButton captureRef={captureRef} userName={userName} />
        </div>
      )}
    </div>
  );
}

interface BracketViewProps {
  bracket: ReturnType<typeof generateFullBracket>;
  picks: Record<string, string>;
  onPick: (matchId: string, team: string) => void;
  locked: boolean;
}

function BracketColHeading({
  name,
  fraction,
  align,
}: {
  name: string;
  fraction: string;
  align: "left" | "right";
}) {
  return (
    <span
      className={clsx(
        "flex-1 min-w-[82px] flex flex-col justify-center gap-0 text-[8px] sm:text-[9px] font-semibold leading-[1.15] text-[#555]",
        align === "left" ? "text-left items-start" : "text-right items-end"
      )}
    >
      <span>{name}</span>
      <span className="font-medium text-[#878787]">{fraction}</span>
    </span>
  );
}

function MirroredBracket({ bracket, picks, onPick, locked }: BracketViewProps) {
  const final = bracket.final[0];
  const champion = picks[final?.id ?? ""] ?? final?.winner ?? null;

  return (
    <div className="block">
      <div className="mb-1.5 flex min-h-[2.35rem] items-stretch">
        <BracketColHeading name="Dieciseisavos" fraction="(1/16)" align="left" />
        <span className="w-1.5 shrink-0" />
        <BracketColHeading name="Octavos" fraction="(1/8)" align="left" />
        <span className="w-1.5 shrink-0" />
        <BracketColHeading name="Cuartos" fraction="(1/4)" align="left" />
        <span className="w-1.5 shrink-0" />
        <BracketColHeading name="Semifinal" fraction="(1/2)" align="left" />
        <span className="w-[182px] shrink-0 text-center text-[10px] font-bold leading-tight text-[#0070ef] flex flex-col justify-center">
          Final
        </span>
        <BracketColHeading name="Semifinal" fraction="(1/2)" align="right" />
        <span className="w-1.5 shrink-0" />
        <BracketColHeading name="Cuartos" fraction="(1/4)" align="right" />
        <span className="w-1.5 shrink-0" />
        <BracketColHeading name="Octavos" fraction="(1/8)" align="right" />
        <span className="w-1.5 shrink-0" />
        <BracketColHeading name="Dieciseisavos" fraction="(1/16)" align="right" />
      </div>

      <div className="flex min-w-0" style={{ height: 760 }}>
        <BracketRound matches={bracket.r32.slice(0, 8)} picks={picks} onPick={onPick} locked={locked} side="left" />
        <BracketConnectors count={4} side="right" />
        <BracketRound matches={bracket.r16.slice(0, 4)} picks={picks} onPick={onPick} locked={locked} side="left" />
        <BracketConnectors count={2} side="right" />
        <BracketRound matches={bracket.qf.slice(0, 2)} picks={picks} onPick={onPick} locked={locked} side="left" />
        <BracketConnectors count={1} side="right" />
        <BracketRound matches={[bracket.sf[0]]} picks={picks} onPick={onPick} locked={locked} side="left" />

        <div className="w-[182px] shrink-0 px-1 flex flex-col items-center justify-center gap-2">
          <MatchCard
            matchId={final?.id ?? "final-1"}
            team1={final?.team1 ?? null}
            team2={final?.team2 ?? null}
            winner={champion}
            onPick={onPick}
            locked={locked}
            emphasized
          />
          <ChampionTile champion={champion} compact />
        </div>

        <BracketRound matches={[bracket.sf[1]]} picks={picks} onPick={onPick} locked={locked} side="right" />
        <BracketConnectors count={1} side="left" />
        <BracketRound matches={bracket.qf.slice(2, 4)} picks={picks} onPick={onPick} locked={locked} side="right" />
        <BracketConnectors count={2} side="left" />
        <BracketRound matches={bracket.r16.slice(4, 8)} picks={picks} onPick={onPick} locked={locked} side="right" />
        <BracketConnectors count={4} side="left" />
        <BracketRound matches={bracket.r32.slice(8, 16)} picks={picks} onPick={onPick} locked={locked} side="right" />
      </div>
    </div>
  );
}

interface BracketRoundProps {
  matches: KnockoutMatch[];
  picks: Record<string, string>;
  onPick: (matchId: string, team: string) => void;
  locked: boolean;
  side: "left" | "right";
}

function BracketRound({ matches, picks, onPick, locked, side }: BracketRoundProps) {
  return (
    <div className="flex flex-1 flex-col min-w-[82px]">
      {matches.map((m) => (
        <div key={m.id} className="flex-1 flex items-center px-0.5">
          <MatchCard
            matchId={m.id}
            team1={m.team1}
            team2={m.team2}
            winner={picks[m.id] ?? m.winner ?? null}
            onPick={onPick}
            locked={locked}
            side={side}
          />
        </div>
      ))}
    </div>
  );
}

function BracketConnectors({ count, side }: { count: number; side: "left" | "right" }) {
  const br = side === "right" ? "border-r" : "border-l";
  const lineColor = "border-[#dedede]";
  return (
    <div className="w-1.5 shrink-0 flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`${side}-${i}`} className="flex-1 flex flex-col">
          <div className={`flex-1 ${br} ${lineColor} border-b ${lineColor} border-dashed`} />
          <div className={`flex-1 ${br} ${lineColor}`} />
          <div className={`flex-1 ${br} ${lineColor}`} />
          <div className={`flex-1 ${br} ${lineColor} border-t ${lineColor} border-dashed`} />
        </div>
      ))}
    </div>
  );
}

function ChampionTile({ champion, compact }: { champion: string | null; compact?: boolean }) {
  return (
    <div
      className={clsx(
        "w-full rounded-lg border border-[#80c7a0] bg-[#d8f5e6] text-center",
        compact ? "p-2" : "p-4"
      )}
    >
      <Trophy className={clsx("mx-auto text-[#3d8b5e]", compact ? "h-6 w-6" : "h-8 w-8")} />
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-[#3d8b5e]">Campeón</p>
      {champion ? (
        <div className="mt-2 inline-flex items-center gap-2">
          <Flag code={champion} size="sm" />
          <span className="font-headline-sm text-headline-sm text-[#1a1a2e]">
            {TEAM_SHORT[champion]}
          </span>
        </div>
      ) : (
        <p className="mt-2 text-[#878787] text-sm">Por definir</p>
      )}
    </div>
  );
}

interface MatchCardProps {
  matchId: string;
  team1: string | null;
  team2: string | null;
  winner: string | null;
  onPick: (matchId: string, team: string) => void;
  locked: boolean;
  emphasized?: boolean;
  side?: "left" | "right";
}

function MatchCard({
  matchId,
  team1,
  team2,
  winner,
  onPick,
  locked,
  emphasized,
  side,
}: MatchCardProps) {
  const rowClasses =
    "w-full rounded-md px-1.5 py-1 text-[11px] leading-tight flex items-center gap-1.5 border transition-colors duration-150";

  return (
    <div
      className={clsx(
        "rounded-lg border bg-white p-1.5 space-y-1",
        emphasized
          ? "border-[#0070ef] shadow-[0_0_12px_rgba(0,112,239,0.12)]"
          : "border-[#dedede]",
        side === "left" && "bracket-stub-right",
        side === "right" && "bracket-stub-left"
      )}
    >
      {[team1, team2].map((team, idx) => {
        if (!team) {
          return (
            <div
              key={idx}
              className={clsx(
                rowClasses,
                "border-[#dedede] bg-[#f8f9fa] text-transparent select-none"
              )}
            >
              <span className="opacity-0">placeholder</span>
            </div>
          );
        }
        const isWinner = winner === team;
        return (
          <button
            key={team}
            type="button"
            disabled={locked}
            onClick={() => onPick(matchId, team)}
            className={clsx(
              rowClasses,
              isWinner
                ? "border-[#0070ef] bg-[#e0efff] text-[#004c84]"
                : "border-[#dedede] text-[#1a1a2e] hover:border-[#0070ef]/40 hover:bg-[#e0efff]/30"
            )}
          >
            <Flag code={team} size="sm" />
            <span className="font-medium whitespace-nowrap">{TEAM_SHORT[team]}</span>
            {isWinner && <CheckCircle2 className="h-3.5 w-3.5 ml-auto shrink-0 text-[#0070ef]" />}
          </button>
        );
      })}
    </div>
  );
}
