import { describe, it, expect } from "vitest";
import { calculateMatchPoints, bracketRoundPoints } from "./calculatePoints";

describe("calculateMatchPoints", () => {
  describe("exact match → 3 pts", () => {
    it("2-1 vs 2-1", () => expect(calculateMatchPoints(2, 1, 2, 1)).toBe(3));
    it("0-0 vs 0-0", () => expect(calculateMatchPoints(0, 0, 0, 0)).toBe(3));
    it("3-3 vs 3-3", () => expect(calculateMatchPoints(3, 3, 3, 3)).toBe(3));
  });

  describe("correct tendency → 1 pt", () => {
    it("team1 wins: 1-0 vs 3-0", () => expect(calculateMatchPoints(1, 0, 3, 0)).toBe(1));
    it("team2 wins: 0-2 vs 1-3", () => expect(calculateMatchPoints(0, 2, 1, 3)).toBe(1));
    it("draw: 1-1 vs 2-2", () => expect(calculateMatchPoints(1, 1, 2, 2)).toBe(1));
    it("draw: 0-0 vs 1-1", () => expect(calculateMatchPoints(0, 0, 1, 1)).toBe(1));
  });

  describe("wrong result → 0 pts", () => {
    it("2-0 vs 0-1", () => expect(calculateMatchPoints(2, 0, 0, 1)).toBe(0));
    it("draw vs team1 win: 1-1 vs 2-0", () => expect(calculateMatchPoints(1, 1, 2, 0)).toBe(0));
    it("wrong winner: 3-0 vs 1-2", () => expect(calculateMatchPoints(3, 0, 1, 2)).toBe(0));
  });
});

describe("bracketRoundPoints", () => {
  it.each([
    ["r32", 1],
    ["r16", 2],
    ["qf", 3],
    ["sf", 4],
    ["final", 5],
    ["champion", 10],
    ["unknown", 0],
  ] as const)("%s → %d pts", (round, expected) => {
    expect(bracketRoundPoints(round)).toBe(expected);
  });
});
