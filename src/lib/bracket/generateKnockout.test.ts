import { describe, it, expect } from "vitest";
import {
  generateR32,
  generateNextRound,
  generateFullBracket,
  type GroupStanding,
} from "./generateKnockout";

const standings: GroupStanding[] = [
  { groupCode: "A", first: "MEX", second: "KOR", third: "RSA" },
  { groupCode: "B", first: "CAN", second: "SUI", third: "BIH" },
  { groupCode: "C", first: "BRA", second: "MAR", third: "HAI" },
  { groupCode: "D", first: "USA", second: "TUR", third: "AUS" },
  { groupCode: "E", first: "GER", second: "ECU", third: "CIV" },
  { groupCode: "F", first: "NED", second: "JPN", third: "SWE" },
  { groupCode: "G", first: "BEL", second: "EGY", third: "IRN" },
  { groupCode: "H", first: "ESP", second: "URU", third: "KSA" },
  { groupCode: "I", first: "FRA", second: "SEN", third: "IRQ" },
  { groupCode: "J", first: "ARG", second: "AUT", third: "ALG" },
  { groupCode: "K", first: "POR", second: "COL", third: "UZB" },
  { groupCode: "L", first: "ENG", second: "CRO", third: "GHA" },
];

const bestThirds = ["RSA", "BIH", "HAI", "AUS", "CIV", "SWE", "IRN", "KSA"];

describe("generateR32", () => {
  const r32 = generateR32(standings, bestThirds);

  it("produces 16 matches", () => {
    expect(r32).toHaveLength(16);
  });

  it("places Group A runner-up in match 1 team1", () => {
    expect(r32[0].team1).toBe("KOR");
  });

  it("places Group B runner-up in match 1 team2", () => {
    expect(r32[0].team2).toBe("SUI");
  });

  it("places Group C winner in match 2 team1", () => {
    expect(r32[1].team1).toBe("BRA");
  });

  it("fills all 8 FIFA third-team slots with selected best thirds", () => {
    const assignedThirds = [r32[2], r32[5], r32[6], r32[7], r32[8], r32[9], r32[12], r32[15]]
      .map((m) => m.team2)
      .filter((t): t is string => Boolean(t));

    expect(assignedThirds).toHaveLength(8);
    assignedThirds.forEach((t) => {
      expect(bestThirds).toContain(t);
    });
  });

  it("includes all group winners and runners-up", () => {
    const allTeams = r32.flatMap((m) => [m.team1, m.team2].filter(Boolean));
    standings.forEach((s) => {
      expect(allTeams).toContain(s.first);
      expect(allTeams).toContain(s.second);
    });
  });
});

describe("generateNextRound", () => {
  const r32 = generateR32(standings, bestThirds);
  const r32WithWinners = r32.map((m) => ({ ...m, winner: m.team1 }));
  const r16 = generateNextRound(r32WithWinners, "r16");

  it("produces 8 R16 matches", () => {
    expect(r16).toHaveLength(8);
  });

  it("feeds R32 match 1 winner into R16 match 1 team1", () => {
    expect(r16[0].team1).toBe(r32WithWinners[0].winner);
  });

  it("feeds R32 match 2 winner into R16 match 1 team2", () => {
    expect(r16[0].team2).toBe(r32WithWinners[1].winner);
  });
});

describe("generateFullBracket", () => {
  const picks: Record<string, string> = {};
  const r32 = generateR32(standings, bestThirds);
  r32.forEach((m) => {
    if (m.team1) picks[m.id] = m.team1;
  });
  const bracket = generateFullBracket(standings, bestThirds, picks);

  it("has 16 R32 matches", () => expect(bracket.r32).toHaveLength(16));
  it("has 8 R16 matches", () => expect(bracket.r16).toHaveLength(8));
  it("has 4 QF matches", () => expect(bracket.qf).toHaveLength(4));
  it("has 2 SF matches", () => expect(bracket.sf).toHaveLength(2));
  it("has 1 Final match", () => expect(bracket.final).toHaveLength(1));
});
