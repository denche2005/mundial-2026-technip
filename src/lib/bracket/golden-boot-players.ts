import { TEAM_NAMES, WORLD_CUP_GROUPS } from "@/lib/bracket/groups";
import squadsData from "@/data/world-cup-2026-squads.json";

export interface GoldenBootPlayer {
  id: string;
  team: string;
  name: string;
}

function slugName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();
}

function buildPlayer(team: string, name: string): GoldenBootPlayer {
  return { id: `${team}-${slugName(name)}`, team, name };
}

const squads = squadsData.squads as Record<string, string[]>;

export const GOLDEN_BOOT_PLAYERS: GoldenBootPlayer[] = (() => {
  const out: GoldenBootPlayer[] = [];
  for (const g of WORLD_CUP_GROUPS) {
    for (const team of g.teams) {
      const names = squads[team] ?? [];
      for (const name of names) {
        out.push(buildPlayer(team, name));
      }
    }
  }
  return out;
})();

export function goldenBootPlayersByTeam(team: string): GoldenBootPlayer[] {
  return GOLDEN_BOOT_PLAYERS.filter((p) => p.team === team);
}

export function findGoldenBootPlayer(id: string | null | undefined): GoldenBootPlayer | null {
  if (!id) return null;
  return GOLDEN_BOOT_PLAYERS.find((p) => p.id === id) ?? null;
}

export const GOLDEN_BOOT_TEAM_OPTIONS = WORLD_CUP_GROUPS.flatMap((g) => g.teams)
  .filter((code) => goldenBootPlayersByTeam(code).length > 0)
  .sort((a, b) => (TEAM_NAMES[a] ?? a).localeCompare(TEAM_NAMES[b] ?? b, "es"));
