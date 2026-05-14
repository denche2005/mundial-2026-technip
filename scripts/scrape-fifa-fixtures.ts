/**
 * scripts/scrape-fifa-fixtures.ts
 * ------------------------------------------------------------------
 * Pulls the official FIFA World Cup 2026 fixtures from the legacy
 * FIFA calendar API (the same one their public site consumes via
 * client-side fetch) and emits two artefacts:
 *
 *   1. scripts/data/fixtures-raw.json        — untouched API payload
 *   2. scripts/data/fixtures-normalized.json — canonical rows ready
 *      for the `public.matches` table
 *
 * It also regenerates `supabase/migrations/014_seed_world_cup_2026_matches.sql`
 * so the SQL seed never drifts from the JSON.
 *
 * Run: `npm run scrape:fixtures`
 *
 * The HTML page at https://www.fifa.com/.../scores-fixtures is a SPA
 * with no embedded NEXT_DATA, so we go straight to the API. The
 * idCompetition (17 = Men's World Cup) is stable; the idSeason for
 * the 2026 edition (285023) was discovered by date-range probe and
 * is double-checked at runtime against the SeasonName field.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------- constants -------------------------------------------------------

const FIFA_COMPETITION_ID = "17"; // Men's World Cup
const FIFA_SEASON_ID = "285023"; // 2026 edition (Canada/Mexico/USA)

const FIFA_API_URL =
  `https://api.fifa.com/api/v3/calendar/matches` +
  `?language=es-ES&count=300` +
  `&idCompetition=${FIFA_COMPETITION_ID}` +
  `&idSeason=${FIFA_SEASON_ID}`;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const OPENFOOTBALL_FALLBACK_URL =
  "https://raw.githubusercontent.com/openfootball/world-cup/master/2026--canada-mexico-usa/cup.txt";

/**
 * 48 teams of the 2026 World Cup, mirroring `src/lib/bracket/groups.ts`.
 * FIFA's `IdCountry` happens to use the same 3-letter codes — we still
 * validate every match against this allow-list so we never quietly
 * insert a typo into the database.
 */
const VALID_TEAM_CODES = new Set<string>([
  "MEX", "RSA", "KOR", "CZE",
  "CAN", "BIH", "QAT", "SUI",
  "BRA", "MAR", "HAI", "SCO",
  "USA", "PAR", "AUS", "TUR",
  "GER", "CUW", "CIV", "ECU",
  "NED", "JPN", "SWE", "TUN",
  "BEL", "EGY", "IRN", "NZL",
  "ESP", "CPV", "KSA", "URU",
  "FRA", "SEN", "IRQ", "NOR",
  "ARG", "ALG", "AUT", "JOR",
  "POR", "COD", "UZB", "COL",
  "ENG", "CRO", "GHA", "PAN",
]);

/**
 * If FIFA ever ships a code we don't recognise (e.g. "BHA" instead of
 * "BIH" for Bosnia, or "RKS" for Kosovo), add a remap here so we keep
 * a single source of truth without falling back to the placeholder.
 */
const TEAM_CODE_REMAP: Record<string, string> = {
  // No overrides today; FIFA codes line up with the repo's set.
};

// ---------- types -----------------------------------------------------------

interface FifaTeam {
  IdCountry: string | null;
  Abbreviation: string | null;
  TeamName: { Locale: string; Description: string }[];
}

interface FifaMatch {
  IdMatch: string;
  Date: string; // ISO 8601 in UTC, e.g. "2026-06-11T19:00:00Z"
  LocalDate: string;
  StageName: { Locale: string; Description: string }[];
  SeasonName?: { Locale: string; Description: string }[];
  GroupName: { Locale: string; Description: string }[] | null;
  Home: FifaTeam | null;
  Away: FifaTeam | null;
  PlaceHolderA: string | null;
  PlaceHolderB: string | null;
  MatchNumber: number;
}

interface FifaApiResponse {
  Results: FifaMatch[];
}

interface OpenFootballMatch {
  date: string;
  team1: string;
  team2: string;
}

interface NormalizedMatch {
  fifa_match_id: string;
  kickoff_at: string; // ISO 8601 UTC
  stage: "group";
  group_code: string; // "A".."L"
  team_1: string;
  team_2: string;
  status: "scheduled";
}

// ---------- helpers ---------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const DATA_DIR = join(__dirname, "data");
const RAW_PATH = join(DATA_DIR, "fixtures-raw.json");
const NORMALIZED_PATH = join(DATA_DIR, "fixtures-normalized.json");
const MIGRATION_PATH = join(
  REPO_ROOT,
  "supabase/migrations/014_seed_world_cup_2026_matches.sql",
);

function log(message: string) {
  process.stdout.write(`[scrape] ${message}\n`);
}

function warn(message: string) {
  process.stderr.write(`[scrape][WARN] ${message}\n`);
}

/** Spanish "Grupo A" -> "A". Returns null if the description is not a group. */
function parseGroupCode(description: string | undefined): string | null {
  if (!description) return null;
  const match = description.match(/Grupo\s+([A-L])/i);
  return match ? match[1].toUpperCase() : null;
}

function normaliseTeamCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  return TEAM_CODE_REMAP[upper] ?? upper;
}

async function fetchFifaMatches(): Promise<FifaApiResponse> {
  log(`GET ${FIFA_API_URL}`);
  const res = await fetch(FIFA_API_URL, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json,*/*;q=0.8",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    },
  });
  if (!res.ok) {
    throw new Error(`FIFA API returned HTTP ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as FifaApiResponse | null;
  if (!json || !Array.isArray(json.Results)) {
    throw new Error("FIFA API returned an empty or malformed payload");
  }
  return json;
}

async function fetchOpenFootballCup(): Promise<OpenFootballMatch[]> {
  log(`Fallback GET ${OPENFOOTBALL_FALLBACK_URL}`);
  const res = await fetch(OPENFOOTBALL_FALLBACK_URL, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/plain,*/*;q=0.8",
    },
  });
  if (!res.ok) {
    throw new Error(
      `OpenFootball fallback returned HTTP ${res.status} ${res.statusText}`,
    );
  }
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  const out: OpenFootballMatch[] = [];

  // Typical format:
  // 2026-06-11
  //   19:00  Mexico        0-0  South Africa
  let currentDate = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      currentDate = trimmed;
      continue;
    }
    const match = trimmed.match(
      /^(\d{1,2}:\d{2})\s+(.+?)\s+v(?:s|\.)?\s+(.+)$/i,
    );
    if (!match || !currentDate) continue;
    out.push({
      date: `${currentDate}T${match[1]}:00Z`,
      team1: match[2].trim(),
      team2: match[3].trim(),
    });
  }
  return out;
}

function normalise(raw: FifaApiResponse): NormalizedMatch[] {
  const groupTotals = new Map<string, number>();
  const seenGroupTeams = new Map<string, Set<string>>();
  const out: NormalizedMatch[] = [];

  for (const match of raw.Results) {
    const stageDesc = match.StageName?.[0]?.Description ?? "";
    const groupCode = parseGroupCode(match.GroupName?.[0]?.Description);

    // Keep group-stage matches only — knockouts hold placeholders until the
    // bracket fills in, and the app simulates them client-side anyway.
    if (!groupCode) {
      continue;
    }

    if (!match.Home?.IdCountry || !match.Away?.IdCountry) {
      warn(
        `Skipping ${stageDesc} match ${match.IdMatch} — missing team ` +
          `(placeholders: ${match.PlaceHolderA}/${match.PlaceHolderB}).`,
      );
      continue;
    }

    const team1 = normaliseTeamCode(match.Home.IdCountry);
    const team2 = normaliseTeamCode(match.Away.IdCountry);

    if (!team1 || !team2) {
      warn(
        `Skipping match ${match.IdMatch}: empty team code ` +
          `(${match.Home.IdCountry} vs ${match.Away.IdCountry}).`,
      );
      continue;
    }

    if (!VALID_TEAM_CODES.has(team1)) {
      warn(
        `Unknown team code "${team1}" in match ${match.IdMatch} ` +
          `(${match.Home.TeamName?.[0]?.Description ?? "?"}). ` +
          `Add a TEAM_CODE_REMAP entry or update bracket/groups.ts.`,
      );
      continue;
    }
    if (!VALID_TEAM_CODES.has(team2)) {
      warn(
        `Unknown team code "${team2}" in match ${match.IdMatch} ` +
          `(${match.Away.TeamName?.[0]?.Description ?? "?"}). ` +
          `Add a TEAM_CODE_REMAP entry or update bracket/groups.ts.`,
      );
      continue;
    }

    if (!match.Date) {
      warn(`Skipping match ${match.IdMatch}: missing kickoff timestamp.`);
      continue;
    }

    const kickoffIso = new Date(match.Date).toISOString();

    out.push({
      fifa_match_id: match.IdMatch,
      kickoff_at: kickoffIso,
      stage: "group",
      group_code: groupCode,
      team_1: team1,
      team_2: team2,
      status: "scheduled",
    });

    groupTotals.set(groupCode, (groupTotals.get(groupCode) ?? 0) + 1);
    let teams = seenGroupTeams.get(groupCode);
    if (!teams) {
      teams = new Set();
      seenGroupTeams.set(groupCode, teams);
    }
    teams.add(team1);
    teams.add(team2);
  }

  // Deterministic ordering: by kickoff, then by group, then by team_1.
  out.sort((a, b) => {
    if (a.kickoff_at !== b.kickoff_at) {
      return a.kickoff_at.localeCompare(b.kickoff_at);
    }
    if (a.group_code !== b.group_code) {
      return a.group_code.localeCompare(b.group_code);
    }
    return a.team_1.localeCompare(b.team_1);
  });

  log(`Normalised ${out.length} group-stage matches`);
  for (const code of [...groupTotals.keys()].sort()) {
    const teams = [...(seenGroupTeams.get(code) ?? [])].sort().join(",");
    const total = groupTotals.get(code) ?? 0;
    const flag = total === 6 ? "OK" : "!!";
    log(`  Group ${code} ${flag} ${total}/6 matches | teams: ${teams}`);
    if (total !== 6) {
      warn(`Group ${code} has ${total} matches, expected 6.`);
    }
  }
  return out;
}

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

function buildMigrationSql(rows: NormalizedMatch[], scrapedAt: string): string {
  const header = `-- supabase/migrations/014_seed_world_cup_2026_matches.sql
--
-- Seed for the FIFA World Cup 2026 group stage (12 groups x 6 matches = 72).
-- Source : api.fifa.com legacy calendar API (idCompetition=${FIFA_COMPETITION_ID}, idSeason=${FIFA_SEASON_ID})
-- Scraped: ${scrapedAt}
--
-- This file is regenerated by \`npm run scrape:fixtures\`. Edit the
-- normalized JSON (scripts/data/fixtures-normalized.json) and re-run
-- the scraper if you need a manual override.
--
-- Knockout fixtures are intentionally omitted: the FIFA API only
-- exposes placeholders (e.g. "1A vs 2B") until the group stage
-- finishes, and the application simulates the bracket client-side.

begin;

delete from public.matches where stage = 'group';
`;

  // Insert in chunks of 12 keeps each statement readable in the diff.
  const CHUNK = 12;
  const blocks: string[] = [];
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const values = slice
      .map(
        (m) =>
          `  ('${escapeSql(m.kickoff_at)}', 'group', '${escapeSql(
            m.group_code,
          )}', '${escapeSql(m.team_1)}', '${escapeSql(
            m.team_2,
          )}', 'scheduled')`,
      )
      .join(",\n");
    blocks.push(
      `insert into public.matches (kickoff_at, stage, group_code, team_1, team_2, status) values\n${values};`,
    );
  }

  const footer = `\ncommit;\n`;
  return `${header}\n${blocks.join("\n\n")}${footer}`;
}

// ---------- main ------------------------------------------------------------

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  let normalized: NormalizedMatch[] = [];
  let sourceLabel = "FIFA API";

  try {
    const raw = await fetchFifaMatches();
    log(`FIFA API returned ${raw.Results.length} total fixtures (groups + KO)`);

    // Sanity check: ensure we truly got WC 2026 records.
    const seasonName =
      raw.Results.find((m) => m.SeasonName?.length)?.SeasonName?.[0]
        ?.Description ?? "";
    log(`Season detected: "${seasonName}"`);
    if (!seasonName.includes("2026")) {
      warn(
        `Unexpected season "${seasonName}". Continuing, but please validate fixtures manually.`,
      );
    }

    writeFileSync(RAW_PATH, JSON.stringify(raw, null, 2));
    log(`Wrote raw payload -> ${RAW_PATH}`);
    normalized = normalise(raw);
  } catch (fifaError) {
    warn(
      `FIFA primary source failed: ${fifaError instanceof Error ? fifaError.message : String(fifaError)}`,
    );
    warn(
      "Attempting fallback source (OpenFootball cup.txt). Team mapping may require manual review.",
    );
    sourceLabel = "OpenFootball fallback";
    const fallbackRaw = await fetchOpenFootballCup();
    writeFileSync(RAW_PATH, JSON.stringify(fallbackRaw, null, 2));
    log(`Wrote raw fallback payload -> ${RAW_PATH}`);
    throw new Error(
      "Fallback source downloaded, but automatic normalization from OpenFootball is not fully implemented yet. " +
        "Edit scripts/data/fixtures-normalized.json manually and re-run if FIFA remains unavailable.",
    );
  }

  if (normalized.length === 0) {
    throw new Error(
      "No group-stage matches normalised. Check the FIFA payload manually.",
    );
  }
  if (normalized.length !== 72) {
    warn(
      `Expected 72 group-stage matches, got ${normalized.length}. ` +
        "Inspect the warnings above before seeding.",
    );
  }

  writeFileSync(NORMALIZED_PATH, JSON.stringify(normalized, null, 2));
  log(`Wrote normalized payload -> ${NORMALIZED_PATH}`);

  const sql = buildMigrationSql(normalized, new Date().toISOString());
  writeFileSync(MIGRATION_PATH, sql);
  log(`Wrote migration -> ${MIGRATION_PATH}`);

  log(`Done. Source used: ${sourceLabel}.`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[scrape][FATAL] ${message}\n`);
  process.exit(1);
});
