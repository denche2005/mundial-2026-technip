/**
 * scripts/seed-matches.ts
 * ------------------------------------------------------------------
 * Pushes the normalised FIFA World Cup 2026 group-stage fixtures into
 * `public.matches` using the Supabase service-role key. Idempotent —
 * deletes existing rows where `stage = 'group'` first.
 *
 * Run: `npm run seed:matches`
 *
 * Reads from:
 *   scripts/data/fixtures-normalized.json (produced by scrape-fifa-fixtures.ts)
 *
 * Reads from .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface NormalizedMatch {
  fifa_match_id?: string;
  kickoff_at: string;
  stage: "group" | "r32" | "r16" | "qf" | "sf" | "final";
  group_code: string | null;
  team_1: string;
  team_2: string;
  status: "scheduled" | "live" | "finished";
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const NORMALIZED_PATH = join(__dirname, "data/fixtures-normalized.json");
const ENV_PATH = join(REPO_ROOT, ".env.local");
const EXPECTED_GROUP_MATCHES = 72;

function log(message: string) {
  process.stdout.write(`[seed] ${message}\n`);
}

/**
 * Tiny .env.local parser. We avoid pulling in `dotenv` because it isn't a
 * dependency of the app — this script must run in a fresh checkout.
 *
 * Supports:
 *   - KEY=value
 *   - KEY="value with spaces"
 *   - KEY='value'
 *   - lines starting with `#` (comments)
 *   - blank lines
 *
 * Existing process.env values win over the file (so CI overrides keep
 * working).
 */
function loadEnvFile(path: string): void {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    log(`No .env file at ${path} — relying on process.env only.`);
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function loadFixtures(): NormalizedMatch[] {
  let raw: string;
  try {
    raw = readFileSync(NORMALIZED_PATH, "utf8");
  } catch {
    throw new Error(
      `Could not read ${NORMALIZED_PATH}. ` +
        "Run `npm run scrape:fixtures` first.",
    );
  }
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(
      `${NORMALIZED_PATH} must contain a JSON array of normalised matches.`,
    );
  }
  return parsed as NormalizedMatch[];
}

function isIsoDate(value: string): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

function normalizeAndValidateFixtures(fixtures: NormalizedMatch[]): NormalizedMatch[] {
  const dedupe = new Set<string>();
  const normalized = fixtures.map((fixture, index) => {
    if (fixture.stage !== "group") {
      throw new Error(
        `Fixture #${index + 1} has stage "${fixture.stage}". Only "group" is allowed in this seed.`,
      );
    }
    if (!fixture.group_code || !/^[A-L]$/.test(fixture.group_code)) {
      throw new Error(
        `Fixture #${index + 1} has invalid group_code "${fixture.group_code ?? "null"}".`,
      );
    }
    if (!/^[A-Z]{3}$/.test(fixture.team_1) || !/^[A-Z]{3}$/.test(fixture.team_2)) {
      throw new Error(
        `Fixture #${index + 1} has invalid team codes "${fixture.team_1}" vs "${fixture.team_2}".`,
      );
    }
    if (!isIsoDate(fixture.kickoff_at)) {
      throw new Error(
        `Fixture #${index + 1} has invalid kickoff_at "${fixture.kickoff_at}". Must be ISO UTC.`,
      );
    }
    if (!["scheduled", "live", "finished"].includes(fixture.status)) {
      throw new Error(
        `Fixture #${index + 1} has invalid status "${fixture.status}".`,
      );
    }
    const signature = [
      fixture.kickoff_at,
      fixture.group_code,
      fixture.team_1,
      fixture.team_2,
    ].join("|");
    if (dedupe.has(signature)) {
      throw new Error(`Duplicate fixture detected at #${index + 1}: ${signature}`);
    }
    dedupe.add(signature);
    return {
      kickoff_at: fixture.kickoff_at,
      stage: "group" as const,
      group_code: fixture.group_code,
      team_1: fixture.team_1,
      team_2: fixture.team_2,
      status: fixture.status,
    };
  });

  normalized.sort((a, b) => {
    if (a.kickoff_at !== b.kickoff_at) return a.kickoff_at.localeCompare(b.kickoff_at);
    if (a.group_code !== b.group_code) return a.group_code.localeCompare(b.group_code);
    if (a.team_1 !== b.team_1) return a.team_1.localeCompare(b.team_1);
    return a.team_2.localeCompare(b.team_2);
  });

  if (normalized.length !== EXPECTED_GROUP_MATCHES) {
    throw new Error(
      `Expected ${EXPECTED_GROUP_MATCHES} group fixtures, got ${normalized.length}.`,
    );
  }
  return normalized;
}

async function main() {
  loadEnvFile(ENV_PATH);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Add them to .env.local before running this script.",
    );
  }

  const fixtures = normalizeAndValidateFixtures(loadFixtures());
  if (fixtures.length === 0) {
    throw new Error("Normalized fixtures file is empty — nothing to seed.");
  }
  log(`Loaded and validated ${fixtures.length} fixtures from ${NORMALIZED_PATH}`);

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  log("Deleting existing group-stage matches…");
  const { error: delError, count: deletedCount } = await supabase
    .from("matches")
    .delete({ count: "exact" })
    .eq("stage", "group");
  if (delError) {
    throw new Error(`Failed to clear existing matches: ${delError.message}`);
  }
  log(`Deleted ${deletedCount ?? 0} existing rows.`);

  // Insert in chunks so we never hit the Supabase request size limit
  // and so a single bad row doesn't poison the entire batch silently.
  const CHUNK_SIZE = 24;
  let inserted = 0;
  for (let i = 0; i < fixtures.length; i += CHUNK_SIZE) {
    const slice = fixtures.slice(i, i + CHUNK_SIZE).map((m) => ({
      kickoff_at: m.kickoff_at,
      stage: m.stage,
      group_code: m.group_code,
      team_1: m.team_1,
      team_2: m.team_2,
      status: m.status,
    }));
    const { error, data } = await supabase
      .from("matches")
      .insert(slice)
      .select("id");
    if (error) {
      throw new Error(
        `Insert failed at chunk ${i / CHUNK_SIZE} (rows ${i}-${i + slice.length}): ${error.message}`,
      );
    }
    inserted += data?.length ?? 0;
    log(`  inserted ${inserted}/${fixtures.length}`);
  }

  const { count: finalCount, error: countError } = await supabase
    .from("matches")
    .select("*", { head: true, count: "exact" })
    .eq("stage", "group");
  if (countError) {
    throw new Error(`Post-seed verification failed: ${countError.message}`);
  }
  if ((finalCount ?? 0) !== EXPECTED_GROUP_MATCHES) {
    throw new Error(
      `Post-seed verification failed: expected ${EXPECTED_GROUP_MATCHES} group matches, got ${finalCount ?? 0}.`,
    );
  }

  log(`Done. Inserted ${inserted} matches into public.matches (verified ${finalCount}).`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[seed][FATAL] ${message}\n`);
  process.exit(1);
});
