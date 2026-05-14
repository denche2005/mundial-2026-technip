import { describe, it, expect } from "vitest";
import {
  pruneBestThirds,
  pruneKnockoutPicks,
  teamsInPlay,
  validThirdTeams,
  type Standings,
} from "./stableThirds";

const baseline: Standings = {
  A: ["MEX", "KOR", "RSA"],
  B: ["CAN", "SUI", "BIH"],
  C: ["BRA", "MAR", "HAI"],
};

describe("validThirdTeams", () => {
  it("returns exactly the 3rd-place team from each completed group", () => {
    const thirds = validThirdTeams(baseline);
    expect(thirds.size).toBe(3);
    expect(thirds).toContain("RSA");
    expect(thirds).toContain("BIH");
    expect(thirds).toContain("HAI");
  });

  it("handles partial groups (no thirds yet)", () => {
    const partial: Standings = { A: ["MEX"], B: [] };
    expect(validThirdTeams(partial).size).toBe(0);
  });
});

describe("pruneBestThirds", () => {
  it("removes a team that is no longer in 3rd after reorder", () => {
    const reordered: Standings = { ...baseline, A: ["MEX", "RSA", "KOR"] };
    const pruned = pruneBestThirds(reordered, ["RSA", "BIH", "HAI"]);
    expect(pruned).not.toContain("RSA");
    expect(pruned).toContain("BIH");
    expect(pruned).toContain("HAI");
  });

  it("drops everything when no thirds are set", () => {
    const partial: Standings = { A: ["MEX"], B: [] };
    expect(pruneBestThirds(partial, ["RSA"])).toHaveLength(0);
  });
});

describe("teamsInPlay", () => {
  it("includes runners-up and excludes unselected thirds", () => {
    const reordered: Standings = { ...baseline, A: ["MEX", "RSA", "KOR"] };
    const prunedThirds = pruneBestThirds(reordered, ["RSA", "BIH", "HAI"]);
    const teams = teamsInPlay(reordered, prunedThirds);
    expect(teams.has("RSA")).toBe(true);  // now 2nd of A
    expect(teams.has("MEX")).toBe(true);  // still 1st of A
    expect(teams.has("KOR")).toBe(false); // now 3rd, not selected as best third
  });
});

describe("pruneKnockoutPicks", () => {
  it("removes stale picks and keeps valid ones", () => {
    const reordered: Standings = { ...baseline, A: ["MEX", "RSA", "KOR"] };
    const prunedThirds = pruneBestThirds(reordered, ["RSA", "BIH", "HAI"]);
    const picks = {
      "r32-1": "KOR", // stale
      "r32-2": "MEX",
      "r32-3": "RSA",
      "r16-1": "BRA",
    };
    const clean = pruneKnockoutPicks(reordered, prunedThirds, picks);
    expect(clean).not.toHaveProperty("r32-1");
    expect(clean["r32-2"]).toBe("MEX");
    expect(clean["r32-3"]).toBe("RSA");
    expect(clean["r16-1"]).toBe("BRA");
  });
});
