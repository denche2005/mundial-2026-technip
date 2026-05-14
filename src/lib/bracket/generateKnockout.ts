/**
 * FIFA World Cup 2026 bracket generation logic.
 * 48 teams: 12 groups of 4 → top 2 + 8 best third-placed → 32 in knockout.
 *
 * R32 bracket structure follows FIFA's official pairing:
 * The 24 group winners/runners-up fill fixed slots.
 * The 8 best thirds are allocated based on which groups they come from.
 */

export interface GroupStanding {
  groupCode: string;
  first: string;
  second: string;
  third: string;
}

export interface KnockoutMatch {
  id: string;
  round: "r32" | "r16" | "qf" | "sf" | "final";
  position: number;
  team1: string | null;
  team2: string | null;
  winner?: string | null;
}

/**
 * Fixed R32 pairing slots for group winners (1st) and runners-up (2nd).
 * Each entry: [matchPosition, slot (1=team1, 2=team2)]
 */
const R32_WINNERS: Record<string, [number, 1 | 2]> = {
  A: [7, 1], B: [13, 1], C: [2, 1], D: [10, 1],
  E: [3, 1], F: [4, 1], G: [9, 1], H: [11, 1],
  I: [6, 1], J: [15, 1], K: [16, 1], L: [8, 1],
};

const R32_RUNNERS: Record<string, [number, 1 | 2]> = {
  A: [1, 1], B: [1, 2], C: [4, 2], D: [14, 1],
  E: [5, 1], F: [2, 2], G: [14, 2], H: [15, 2],
  I: [5, 2], J: [11, 2], K: [12, 1], L: [12, 2],
};

/**
 * FIFA official Round-of-32 slots that contain a 3rd-placed team.
 * `allowedGroups` comes directly from fixtures notation:
 * - 3ABCDF, 3CDFGH, etc.
 */
const THIRD_SLOT_RULES: { matchPos: number; slot: 1 | 2; allowedGroups: string[] }[] = [
  { matchPos: 3, slot: 2, allowedGroups: ["A", "B", "C", "D", "F"] }, // 3ABCDF
  { matchPos: 6, slot: 2, allowedGroups: ["C", "D", "F", "G", "H"] }, // 3CDFGH
  { matchPos: 7, slot: 2, allowedGroups: ["C", "E", "F", "H", "I"] }, // 3CEFHI
  { matchPos: 8, slot: 2, allowedGroups: ["E", "H", "I", "J", "K"] }, // 3EHIJK
  { matchPos: 9, slot: 2, allowedGroups: ["A", "E", "H", "I", "J"] }, // 3AEHIJ
  { matchPos: 10, slot: 2, allowedGroups: ["B", "E", "F", "I", "J"] }, // 3BEFIJ
  { matchPos: 13, slot: 2, allowedGroups: ["E", "F", "G", "I", "J"] }, // 3EFGIJ
  { matchPos: 16, slot: 2, allowedGroups: ["D", "E", "I", "J", "L"] }, // 3DEIJL
];

interface ThirdTeam {
  team: string;
  group: string;
  rank: number;
}

function assignThirdTeamsFifa(thirds: ThirdTeam[]): Map<number, string> | null {
  const byGroup = new Map(thirds.map((t) => [t.group, t]));
  const selectedGroups = new Set(thirds.map((t) => t.group));
  const result = new Map<number, string>();
  const usedGroups = new Set<string>();

  const rules = THIRD_SLOT_RULES.map((r) => ({
    ...r,
    candidates: r.allowedGroups.filter((g) => selectedGroups.has(g)),
  }));

  // If any rule has no possible group, this selection cannot be assigned.
  if (rules.some((r) => r.candidates.length === 0)) return null;

  // Deterministic backtracking:
  // 1) tighter slots first (fewer candidates),
  // 2) original fixture order tie-break.
  const order = rules
    .map((r, idx) => ({ ...r, idx }))
    .sort((a, b) => a.candidates.length - b.candidates.length || a.idx - b.idx);

  function dfs(i: number): boolean {
    if (i === order.length) return true;
    const current = order[i];

    // Prefer better-ranked thirds first to keep deterministic behavior.
    const groupOptions = [...current.candidates].sort((ga, gb) => {
      const ra = byGroup.get(ga)?.rank ?? Number.MAX_SAFE_INTEGER;
      const rb = byGroup.get(gb)?.rank ?? Number.MAX_SAFE_INTEGER;
      return ra - rb;
    });

    for (const group of groupOptions) {
      if (usedGroups.has(group)) continue;
      const team = byGroup.get(group)?.team;
      if (!team) continue;
      usedGroups.add(group);
      result.set(current.matchPos, team);
      if (dfs(i + 1)) return true;
      result.delete(current.matchPos);
      usedGroups.delete(group);
    }
    return false;
  }

  return dfs(0) ? result : null;
}

export function generateR32(standings: GroupStanding[], bestThirds: string[]): KnockoutMatch[] {
  const matches: KnockoutMatch[] = Array.from({ length: 16 }, (_, i) => ({
    id: `r32-${i + 1}`,
    round: "r32" as const,
    position: i + 1,
    team1: null,
    team2: null,
  }));

  for (const s of standings) {
    const winSlot = R32_WINNERS[s.groupCode];
    if (winSlot) {
      const [pos, slot] = winSlot;
      if (slot === 1) matches[pos - 1].team1 = s.first;
      else matches[pos - 1].team2 = s.first;
    }

    const runSlot = R32_RUNNERS[s.groupCode];
    if (runSlot) {
      const [pos, slot] = runSlot;
      if (slot === 1) matches[pos - 1].team1 = s.second;
      else matches[pos - 1].team2 = s.second;
    }
  }

  // Map each selected third-placed team to its group (A..L).
  const thirdTeamToGroup = new Map(
    standings
      .filter((s) => s.third)
      .map((s) => [s.third, s.groupCode])
  );
  const selectedThirds: ThirdTeam[] = bestThirds
    .slice(0, 8)
    .map((team, rank) => {
      const group = thirdTeamToGroup.get(team);
      return group ? { team, group, rank } : null;
    })
    .filter((x): x is ThirdTeam => x !== null);

  const thirdAssignment = assignThirdTeamsFifa(selectedThirds);

  // Fill FIFA third-team slots. If assignment fails (invalid selection),
  // leave those slots undefined rather than placing teams incorrectly.
  for (const rule of THIRD_SLOT_RULES) {
    const assignedTeam = thirdAssignment?.get(rule.matchPos) ?? null;
    if (rule.slot === 1) matches[rule.matchPos - 1].team1 = assignedTeam;
    else matches[rule.matchPos - 1].team2 = assignedTeam;
  }

  return matches;
}

export function generateNextRound(
  prevMatches: KnockoutMatch[],
  round: "r16" | "qf" | "sf" | "final"
): KnockoutMatch[] {
  const count = prevMatches.length / 2;
  return Array.from({ length: count }, (_, i) => ({
    id: `${round}-${i + 1}`,
    round,
    position: i + 1,
    team1: prevMatches[i * 2]?.winner ?? null,
    team2: prevMatches[i * 2 + 1]?.winner ?? null,
  }));
}

export function generateFullBracket(
  standings: GroupStanding[],
  bestThirds: string[],
  picks: Record<string, string>
): { r32: KnockoutMatch[]; r16: KnockoutMatch[]; qf: KnockoutMatch[]; sf: KnockoutMatch[]; final: KnockoutMatch[] } {
  const r32 = generateR32(standings, bestThirds);

  r32.forEach((m) => {
    m.winner = picks[m.id] || null;
  });

  const r16 = generateNextRound(r32, "r16");
  r16.forEach((m) => {
    m.winner = picks[m.id] || null;
  });

  const qf = generateNextRound(r16, "qf");
  qf.forEach((m) => {
    m.winner = picks[m.id] || null;
  });

  const sf = generateNextRound(qf, "sf");
  sf.forEach((m) => {
    m.winner = picks[m.id] || null;
  });

  const final_ = generateNextRound(sf, "final");
  final_.forEach((m) => {
    m.winner = picks[m.id] || null;
  });

  return { r32, r16, qf, sf, final: final_ };
}
