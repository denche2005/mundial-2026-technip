/**
 * Scoring logic (mirrors the SQL function for client-side preview).
 */

export function calculateMatchPoints(
  predGoals1: number,
  predGoals2: number,
  realGoals1: number,
  realGoals2: number
): number {
  if (predGoals1 === realGoals1 && predGoals2 === realGoals2) {
    return 3;
  }

  const predDiff = predGoals1 - predGoals2;
  const realDiff = realGoals1 - realGoals2;

  if (
    (predDiff > 0 && realDiff > 0) ||
    (predDiff < 0 && realDiff < 0) ||
    (predDiff === 0 && realDiff === 0)
  ) {
    return 1;
  }

  return 0;
}

export function bracketRoundPoints(round: string): number {
  switch (round) {
    case "r32": return 1;
    case "r16": return 2;
    case "qf": return 3;
    case "sf": return 4;
    case "final": return 5;
    case "champion": return 10;
    default: return 0;
  }
}
