/**
 * Pure helpers extracted from the bracket simulator to make the regression
 * tests around "reordering groups breaks the best-thirds selection" easy to
 * run in isolation.
 *
 * These helpers must produce the same result as the in-component logic in
 * `bracket-simulator.tsx`. Keep them in sync.
 */

export type Standings = Record<string, string[]>;

/**
 * Returns the set of teams that are still considered "third" given the
 * current standings. Used to prune stale best-thirds picks after the user
 * reorders a group.
 */
export function validThirdTeams(standings: Standings): Set<string> {
  return new Set(
    Object.values(standings)
      .filter((arr) => arr.length >= 3)
      .map((arr) => arr[2])
  );
}

/**
 * Drop any team from `bestThirds` that is no longer the third in its group.
 */
export function pruneBestThirds(
  standings: Standings,
  bestThirds: string[]
): string[] {
  const valid = validThirdTeams(standings);
  return bestThirds.filter((t) => valid.has(t));
}

/**
 * Compute the set of teams still in play (1st, 2nd of each group + selected
 * best thirds). Picks for knockout matches that reference any other team are
 * stale and must be pruned.
 */
export function teamsInPlay(
  standings: Standings,
  bestThirds: string[]
): Set<string> {
  const set = new Set<string>();
  for (const arr of Object.values(standings)) {
    if (arr[0]) set.add(arr[0]);
    if (arr[1]) set.add(arr[1]);
  }
  for (const t of bestThirds) set.add(t);
  return set;
}

export function pruneKnockoutPicks(
  standings: Standings,
  bestThirds: string[],
  picks: Record<string, string>
): Record<string, string> {
  const teams = teamsInPlay(standings, bestThirds);
  const next: Record<string, string> = {};
  for (const [matchId, team] of Object.entries(picks)) {
    if (teams.has(team)) next[matchId] = team;
  }
  return next;
}
