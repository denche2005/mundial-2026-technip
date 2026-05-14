"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Trophy, Save } from "lucide-react";
import { saveBracketRound } from "@/app/app/admin/bracket/actions";
import { Flag } from "@/components/ui/flag";

type RoundKey = "r32" | "r16" | "qf" | "sf" | "final";

interface RoundBlock {
    round: RoundKey;
    label: string;
    matches: {
        id: string;
        position: number;
        team1: string;
        team2: string;
        kickoffAt: string;
        status: string;
        goals1: number | null;
        goals2: number | null;
    }[];
}

interface ResultRow {
    round: string;
    position: number;
    team: string;
}

function keyOf(round: string, position: number) {
    return `${round}:${position}`;
}

export function AdminBracketPanel({
    rounds,
    initialResults,
    teamPool,
}: {
    rounds: RoundBlock[];
    initialResults: ResultRow[];
    teamPool: string[];
}) {
    const initialMap = useMemo(() => {
        const m = new Map<string, string>();
        for (const row of initialResults) {
            const pos = row.round === "champion" ? row.position : normalizeResultPosition(row.position);
            if (pos > 0) {
                m.set(keyOf(row.round, pos), row.team);
            }
        }
        return m;
    }, [initialResults]);

    const [selected, setSelected] = useState<Map<string, string>>(new Map(initialMap));
    const [champion, setChampion] = useState<string>(initialMap.get("champion:1") ?? "");
    const [error, setError] = useState("");
    const [ok, setOk] = useState("");
    const [pending, startTransition] = useTransition();

    const selectedByRound = useMemo(() => {
        const m = new Map<RoundKey, string[]>();
        for (const round of ["r32", "r16", "qf", "sf", "final"] as const) {
            m.set(round, getRoundSelectedTeams(round, selected));
        }
        return m;
    }, [selected]);

    const candidatesByRound = useMemo(() => {
        return {
            r32: teamPool,
            r16: selectedByRound.get("r32") ?? [],
            qf: selectedByRound.get("r16") ?? [],
            sf: selectedByRound.get("qf") ?? [],
            final: selectedByRound.get("sf") ?? [],
        } as Record<RoundKey, string[]>;
    }, [selectedByRound, teamPool]);

    const finalCandidates = useMemo(() => {
        const finalists = selectedByRound.get("final") ?? [];
        return finalists.length > 0 ? finalists : candidatesByRound.final;
    }, [selectedByRound, candidatesByRound.final]);

    function choose(round: RoundKey, position: number, team: string) {
        setSelected((prev) => {
            const next = new Map(prev);
            next.set(keyOf(round, position), team);
            return next;
        });
    }

    function toggleRoundTeam(round: RoundKey, team: string) {
        const target = defaultSlotCount(round);
        const current = selectedByRound.get(round) ?? [];
        const exists = current.includes(team);
        const nextTeams = exists
            ? current.filter((t) => t !== team)
            : current.length < target
                ? [...current, team]
                : current;

        setSelected((prev) => {
            const next = new Map(prev);
            for (let i = 1; i <= defaultSlotCount(round); i += 1) {
                next.delete(keyOf(round, i));
            }
            nextTeams.forEach((t, idx) => {
                next.set(keyOf(round, idx + 1), t);
            });
            return next;
        });
    }

    function clearRound(round: RoundKey) {
        setSelected((prev) => {
            const next = new Map(prev);
            for (const key of Array.from(next.keys())) {
                if (key.startsWith(`${round}:`)) next.delete(key);
            }
            return next;
        });
    }

    function resetSavedRound(round: RoundKey) {
        setError("");
        setOk("");
        startTransition(async () => {
            const res = await saveBracketRound(round, []);
            if (res.error) {
                setError(res.error);
                return;
            }
            clearRound(round);
            if (round === "final") setChampion("");
            setOk(`Ronda ${roundLabel(round)} reiniciada`);
        });
    }

    function saveRound(round: RoundKey) {
        setError("");
        setOk("");

        const picks = (selectedByRound.get(round) ?? []).map((team, idx) => ({
            position: idx + 1,
            team,
        }));

        const required = defaultSlotCount(round);
        if (picks.length !== required) {
            setError(`Debes seleccionar ${required} equipos en ${roundLabel(round)}.`);
            return;
        }

        startTransition(async () => {
            const res = await saveBracketRound(round, picks);
            if (res.error) {
                setError(res.error);
            } else {
                setOk(`Ronda ${roundLabel(round)} guardada`);
            }
        });
    }

    function saveChampion() {
        setError("");
        setOk("");

        startTransition(async () => {
            const res = await saveBracketRound(
                "champion",
                champion ? [{ position: 1, team: champion }] : []
            );
            if (res.error) {
                setError(res.error);
            } else {
                setOk("Campeón guardado");
            }
        });
    }

    // suppress unused var lint — choose is available for future match-based UI
    void choose;

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-lg border border-[#e84242]/30 bg-[#ffdad6] p-3 text-sm text-[#e84242]">
                    {error}
                </div>
            )}
            {ok && (
                <div className="rounded-lg border border-[#80c7a0]/40 bg-[#d8f5e6] p-3 text-sm text-[#2d6a4f] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {ok}
                </div>
            )}

            <section className="rounded-xl border border-[#dedede] bg-white p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <p className="text-[10px] font-bold tracking-widest text-[#878787] uppercase">Resultados oficiales</p>
                        <p className="text-sm text-[#555]">Marca ganadores por ronda. Los picks guardados reemplazan lo previo.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#878787]">
                        <span className="rounded-full border border-[#dedede] bg-[#f0f2f5] px-3 py-1">Guardado por ronda</span>
                        <span className="rounded-full border border-[#dedede] bg-[#f0f2f5] px-3 py-1">Campeón final</span>
                    </div>
                </div>
            </section>

            {rounds.map((round) => (
                <section key={round.round} className="rounded-xl border border-[#dedede] bg-white p-4 md:p-6 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                            <h2 className="font-bold text-lg text-[#004c84]">{round.label}</h2>
                            <p className="text-xs text-[#555]">
                                Selecciona {defaultSlotCount(round.round)} equipos y guarda la ronda.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => clearRound(round.round)}
                                className="rounded-lg border border-[#dedede] bg-[#f0f2f5] px-3 py-1.5 text-xs font-semibold text-[#555] hover:text-[#1a1a2e]"
                                disabled={pending}
                            >
                                Limpiar
                            </button>
                            <button
                                type="button"
                                onClick={() => resetSavedRound(round.round)}
                                className="rounded-lg border border-[#dedede] bg-[#f0f2f5] px-3 py-1.5 text-xs font-semibold text-[#555] hover:text-[#1a1a2e] disabled:opacity-60"
                                disabled={pending}
                            >
                                Reiniciar ronda
                            </button>
                            <button
                                type="button"
                                onClick={() => saveRound(round.round)}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#0070ef] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(0,112,239,0.2)] disabled:opacity-60"
                                disabled={pending}
                            >
                                <Save className="h-3.5 w-3.5" /> Guardar ronda
                            </button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#dedede] bg-[#f8f9fa] p-3">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs text-[#878787]">
                                Seleccionados: {(selectedByRound.get(round.round) ?? []).length}/{defaultSlotCount(round.round)}
                            </p>
                            {round.matches.length > 0 && (
                                <p className="text-[11px] text-[#878787]">
                                    Hay {round.matches.length} cruces cargados en esta ronda.
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {(candidatesByRound[round.round] ?? []).map((team) => {
                                const active = (selectedByRound.get(round.round) ?? []).includes(team);
                                return (
                                    <button
                                        key={`${round.round}-${team}`}
                                        type="button"
                                        onClick={() => toggleRoundTeam(round.round, team)}
                                        className={`rounded-lg border px-3 py-2 text-left transition flex items-center gap-2 ${active
                                            ? "border-[#0070ef] bg-[#e0efff] text-[#004c84]"
                                            : "border-[#dedede] bg-white text-[#555] hover:border-[#0070ef]/40"
                                            }`}
                                    >
                                        <Flag code={team} size="sm" rounded="full" />
                                        <span className="font-semibold text-sm">{team}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
            ))}

            <section className="rounded-xl border border-[#dedede] bg-white p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <h2 className="font-bold text-lg text-[#004c84] flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-[#80c7a0]" /> Campeón
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setChampion("");
                                startTransition(async () => {
                                    const res = await saveBracketRound("champion", []);
                                    if (res.error) setError(res.error);
                                    else setOk("Campeón reiniciado");
                                });
                            }}
                            className="rounded-lg border border-[#dedede] bg-[#f0f2f5] px-3 py-1.5 text-xs font-semibold text-[#555] hover:text-[#1a1a2e] disabled:opacity-60"
                            disabled={pending}
                        >
                            Reiniciar
                        </button>
                        <button
                            type="button"
                            onClick={saveChampion}
                            className="inline-flex items-center gap-1 rounded-md bg-[#0070ef] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                            disabled={pending}
                        >
                            <Save className="h-3.5 w-3.5" /> Guardar campeón
                        </button>
                    </div>
                </div>

                {finalCandidates.length === 0 ? (
                    <p className="text-sm text-[#555]">
                        Primero selecciona finalistas (en ronda Final) para poder marcar campeón.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {finalCandidates.map((team) => {
                            const active = champion === team;
                            return (
                                <button
                                    type="button"
                                    key={`champion-${team}`}
                                    onClick={() => setChampion(team)}
                                    className={`rounded-lg border px-3 py-2 text-left transition flex items-center gap-2 ${active
                                        ? "border-[#80c7a0] bg-[#d8f5e6] text-[#2d6a4f]"
                                        : "border-[#dedede] bg-[#f8f9fa] text-[#555] hover:border-[#80c7a0]/40"
                                        }`}
                                >
                                    <Flag code={team} size="sm" rounded="full" />
                                    <span className="font-semibold text-sm">{team}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

function getRoundSelectedTeams(round: RoundKey, selected: Map<string, string>) {
    const teams = new Set<string>();
    for (const [key, team] of selected.entries()) {
        if (key.startsWith(`${round}:`) && team) teams.add(team);
    }
    return Array.from(teams);
}

function defaultSlotCount(round: RoundKey) {
    if (round === "r32") return 32;
    if (round === "r16") return 16;
    if (round === "qf") return 8;
    if (round === "sf") return 4;
    return 2;
}

function roundLabel(round: RoundKey) {
    if (round === "r32") return "1/16";
    if (round === "r16") return "1/8";
    if (round === "qf") return "Cuartos";
    if (round === "sf") return "Semifinal";
    return "Final";
}

function normalizeResultPosition(position: number) {
    if (position >= 101) return position - 100;
    return position;
}
