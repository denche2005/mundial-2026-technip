/**
 * RLS Audit — inspect the current state of Row Level Security on the
 * Supabase project and emit a machine-readable JSON + a human-readable
 * console summary.
 *
 * Why this exists: the Supabase Studio shows a red "Unrestricted" badge
 * next to any table where RLS is disabled. With the anon key sitting in
 * the browser bundle, "Unrestricted" means a hostile actor can read or
 * write that table over the public REST endpoint. This script tells us
 * exactly which tables are in that state so the lockdown migration only
 * touches what needs touching.
 *
 * Strategy (in order, each is a fallback for the previous one):
 *   1. LIVE via PostgREST RPC — if a function `_rls_audit_dump` exists
 *      in the database, call it. This gives the ground truth straight
 *      from `pg_catalog`. Easiest setup is to paste the snippet from
 *      `scripts/sql/audit-rls-rpc.sql` once into the SQL editor; from
 *      then on `npm run audit:rls` works against the real DB.
 *   2. LIVE via PostgREST direct probes — for each table we know about
 *      from the migrations, hit the REST endpoint with the anon key and
 *      record whether it accepts a read. If anon can read it, RLS is
 *      either disabled or has a permissive `using (true)` SELECT policy.
 *   3. STATIC parse of `supabase/migrations/*.sql` — the source of
 *      truth for what *should* be in the DB. We compute the cumulative
 *      effect of every `enable row level security` / `disable row level
 *      security` / `create policy` statement.
 *
 * Output:
 *   - scripts/data/rls-audit.json   (full structured report)
 *   - console summary (table → RLS state, # policies, recommendation)
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/audit-rls.ts
 *   # or
 *   npm run audit:rls
 *
 * SAFETY: read-only. Never writes to the database. Service role key is
 * used purely for the RPC fallback (which itself only SELECTs from
 * pg_catalog).
 */

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { existsSync } from "node:fs";

type RlsTableState = {
  table: string;
  rls_enabled: boolean | null;
  rls_forced: boolean | null;
  policy_count: number | null;
  policies: Array<{
    name: string;
    cmd: string;
    roles: string[] | null;
    qual: string | null;
    with_check: string | null;
  }>;
  anon_can_read: boolean | null;
  source: "live-rpc" | "live-probe" | "static" | "unknown";
  recommendation: string;
};

type AuditReport = {
  generated_at: string;
  supabase_url: string;
  source_priority: string[];
  tables: RlsTableState[];
  views: Array<{
    view: string;
    security_invoker: boolean | null;
    source: "live-rpc" | "static" | "unknown";
    note: string;
  }>;
  summary: {
    unrestricted_tables: string[];
    rls_without_policies: string[];
    suspicious_views: string[];
  };
};

const MIGRATIONS_DIR = resolve(process.cwd(), "supabase", "migrations");
const OUT_PATH = resolve(process.cwd(), "scripts", "data", "rls-audit.json");

// Tables we expect to exist in `public`, derived from the migrations.
// Used both for live probing and as the canonical list to report on.
const KNOWN_TABLES = [
  "profiles",
  "matches",
  "match_predictions",
  "bracket_predictions",
  "bracket_results",
  "tournament_config",
  "groups",
  "group_members",
  "group_invites",
  "app_events",
] as const;

const KNOWN_VIEWS = [
  "user_bracket_points",
  "user_match_points",
  "leaderboard_view",
  "group_leaderboard_view",
] as const;

function env(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) {
    throw new Error(
      `Missing env var ${name}. Run with --env-file=.env.local or set it explicitly.`
    );
  }
  return v;
}

// ---------------------------------------------------------------------------
// Source 1: Live RPC (preferred)
// ---------------------------------------------------------------------------

async function tryLiveRpc(
  url: string,
  serviceKey: string
): Promise<{ tables: Map<string, RlsTableState>; views: AuditReport["views"] } | null> {
  const client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.rpc("_rls_audit_dump");
  if (error || !data) {
    return null;
  }

  const payload = data as {
    tables: Array<{
      tablename: string;
      rowsecurity: boolean;
      rowsecurity_forced: boolean;
      policies: Array<{
        policyname: string;
        cmd: string;
        roles: string[] | null;
        qual: string | null;
        with_check: string | null;
      }>;
    }>;
    views: Array<{
      viewname: string;
      security_invoker: boolean;
    }>;
  };

  const tables = new Map<string, RlsTableState>();
  for (const t of payload.tables) {
    tables.set(t.tablename, {
      table: t.tablename,
      rls_enabled: t.rowsecurity,
      rls_forced: t.rowsecurity_forced,
      policy_count: t.policies.length,
      policies: t.policies.map((p) => ({
        name: p.policyname,
        cmd: p.cmd,
        roles: p.roles,
        qual: p.qual,
        with_check: p.with_check,
      })),
      anon_can_read: null,
      source: "live-rpc",
      recommendation: recommendForTable(t.tablename, t.rowsecurity, t.policies.length),
    });
  }

  const views: AuditReport["views"] = payload.views.map((v) => ({
    view: v.viewname,
    security_invoker: v.security_invoker,
    source: "live-rpc",
    note: v.security_invoker
      ? "OK: view runs with caller privileges; underlying RLS applies."
      : "Runs as creator (definer). Underlying RLS is bypassed when the view is queried by anon/authenticated.",
  }));

  return { tables, views };
}

// ---------------------------------------------------------------------------
// Source 2: Live probe with anon key
// ---------------------------------------------------------------------------

async function probeAnonReads(
  url: string,
  anonKey: string,
  knownTables: readonly string[]
): Promise<Map<string, boolean>> {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = new Map<string, boolean>();
  for (const table of knownTables) {
    try {
      // HEAD-style count probe: cheapest way to ask "can I read this?".
      const { error, count } = await client
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        // PostgREST returns a 401/403/permission denied when RLS denies.
        result.set(table, false);
      } else {
        // count can be 0 (empty table) but the read itself was allowed.
        result.set(table, true);
        if (count === null) {
          // Unexpected; treat as readable.
        }
      }
    } catch {
      result.set(table, false);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Source 3: Static parse of migrations
// ---------------------------------------------------------------------------

type StaticState = {
  tables: Map<string, { rls_enabled: boolean; policies: Set<string> }>;
  views: Set<string>;
};

async function staticParse(): Promise<StaticState> {
  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const tables = new Map<string, { rls_enabled: boolean; policies: Set<string> }>();
  const views = new Set<string>();

  for (const f of files) {
    const sql = await readFile(resolve(MIGRATIONS_DIR, f), "utf8");
    const lower = sql.toLowerCase();

    // Find table creations (we don't track schema, just names).
    for (const m of lower.matchAll(/create table\s+(?:if not exists\s+)?(?:public\.)?([a-z_][a-z0-9_]*)/g)) {
      if (!tables.has(m[1])) {
        tables.set(m[1], { rls_enabled: false, policies: new Set() });
      }
    }

    // Find view creations.
    for (const m of lower.matchAll(/create\s+(?:or\s+replace\s+)?view\s+(?:public\.)?([a-z_][a-z0-9_]*)/g)) {
      views.add(m[1]);
    }

    for (const m of lower.matchAll(
      /alter table\s+(?:public\.)?([a-z_][a-z0-9_]*)\s+enable row level security/g
    )) {
      const t = tables.get(m[1]) ?? { rls_enabled: false, policies: new Set() };
      t.rls_enabled = true;
      tables.set(m[1], t);
    }
    for (const m of lower.matchAll(
      /alter table\s+(?:public\.)?([a-z_][a-z0-9_]*)\s+disable row level security/g
    )) {
      const t = tables.get(m[1]) ?? { rls_enabled: false, policies: new Set() };
      t.rls_enabled = false;
      tables.set(m[1], t);
    }

    for (const m of lower.matchAll(
      /create policy\s+"([^"]+)"\s+on\s+(?:public\.)?([a-z_][a-z0-9_]*)/g
    )) {
      const t = tables.get(m[2]) ?? { rls_enabled: false, policies: new Set() };
      t.policies.add(m[1]);
      tables.set(m[2], t);
    }
    for (const m of lower.matchAll(
      /drop policy\s+(?:if exists\s+)?"([^"]+)"\s+on\s+(?:public\.)?([a-z_][a-z0-9_]*)/g
    )) {
      const t = tables.get(m[2]);
      if (t) t.policies.delete(m[1]);
    }
  }

  return { tables, views };
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

function recommendForTable(
  table: string,
  rlsEnabled: boolean | null,
  policyCount: number | null
): string {
  if (rlsEnabled === false) {
    return `CRITICAL: RLS disabled. Anon can read/write the entire table over the public REST endpoint. Lock down in 015_rls_lockdown.sql.`;
  }
  if (rlsEnabled === true && (policyCount ?? 0) === 0) {
    if (table === "app_events") {
      return `OK: RLS enabled, no policies → only service_role can access. This is intentional for audit logs.`;
    }
    return `RESTRICTIVE: RLS enabled but no policies. No client-side role can access. Add explicit policies if non-service traffic is expected.`;
  }
  return `Review policies match the access control matrix.`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  console.log("RLS Audit for", url);
  console.log("");

  const sourcesUsed: string[] = [];
  const tables = new Map<string, RlsTableState>();
  let views: AuditReport["views"] = [];

  // 1) Live RPC.
  console.log("[1/3] Trying live RPC `_rls_audit_dump`...");
  const live = await tryLiveRpc(url, serviceKey);
  if (live) {
    console.log("      OK live RPC returned", live.tables.size, "tables");
    for (const [k, v] of live.tables) tables.set(k, v);
    views = live.views;
    sourcesUsed.push("live-rpc");
  } else {
    console.log("      WARN RPC not installed (expected on first run). Continuing.");
    console.log(
      "        (To enable: paste scripts/sql/audit-rls-rpc.sql into the SQL editor.)"
    );
  }

  // 2) Live anon probe — augment whatever we have.
  console.log("[2/3] Probing anon read access on known tables...");
  const probe = await probeAnonReads(url, anonKey, KNOWN_TABLES);
  for (const [t, canRead] of probe) {
    const existing = tables.get(t);
    if (existing) {
      existing.anon_can_read = canRead;
    } else {
      tables.set(t, {
        table: t,
        rls_enabled: null,
        rls_forced: null,
        policy_count: null,
        policies: [],
        anon_can_read: canRead,
        source: "live-probe",
        recommendation: canRead
          ? `CRITICAL: anon successfully read this table. RLS is either disabled or has a permissive SELECT policy. Verify in 015_rls_lockdown.sql.`
          : `OK: anon was denied. Likely RLS-protected (or the table does not exist).`,
      });
    }
  }
  sourcesUsed.push("live-probe");
  console.log(
    "      OK probed",
    probe.size,
    "tables (anon-readable:",
    [...probe.entries()].filter(([, v]) => v).map(([k]) => k).join(", ") || "none",
    ")"
  );

  // 3) Static parse — fill in anything we still don't know.
  console.log("[3/3] Static parse of supabase/migrations/*.sql...");
  const staticState = await staticParse();
  for (const [t, info] of staticState.tables) {
    const existing = tables.get(t);
    if (existing) {
      // Live data wins. But fill in unknowns from static.
      if (existing.rls_enabled === null) existing.rls_enabled = info.rls_enabled;
      if (existing.policy_count === null) existing.policy_count = info.policies.size;
    } else {
      tables.set(t, {
        table: t,
        rls_enabled: info.rls_enabled,
        rls_forced: null,
        policy_count: info.policies.size,
        policies: [...info.policies].map((name) => ({
          name,
          cmd: "?",
          roles: null,
          qual: null,
          with_check: null,
        })),
        anon_can_read: null,
        source: "static",
        recommendation: recommendForTable(t, info.rls_enabled, info.policies.size),
      });
    }
  }
  if (views.length === 0) {
    views = [...staticState.views].map((v) => ({
      view: v,
      security_invoker: null,
      source: "static" as const,
      note: "Static parse cannot tell `security_invoker` from migration files alone. Default in Postgres ≤ 14 is definer-equivalent. Run the live RPC for ground truth.",
    }));
  }
  sourcesUsed.push("static");
  console.log("      OK parsed", staticState.tables.size, "tables,", staticState.views.size, "views");

  // Compose report.
  const report: AuditReport = {
    generated_at: new Date().toISOString(),
    supabase_url: url,
    source_priority: sourcesUsed,
    tables: [...tables.values()].sort((a, b) => a.table.localeCompare(b.table)),
    views,
    summary: {
      unrestricted_tables: [...tables.values()]
        .filter((t) => t.rls_enabled === false || t.anon_can_read === true)
        .map((t) => t.table)
        .sort(),
      rls_without_policies: [...tables.values()]
        .filter(
          (t) => t.rls_enabled === true && (t.policy_count ?? 0) === 0 && t.table !== "app_events"
        )
        .map((t) => t.table)
        .sort(),
      suspicious_views: views
        .filter((v) => v.security_invoker === false)
        .map((v) => v.view)
        .sort(),
    },
  };

  // Write JSON.
  if (!existsSync(dirname(OUT_PATH))) {
    await mkdir(dirname(OUT_PATH), { recursive: true });
  }
  await writeFile(OUT_PATH, JSON.stringify(report, null, 2), "utf8");

  // Console summary.
  console.log("");
  console.log("-".repeat(72));
  console.log("RLS AUDIT SUMMARY");
  console.log("-".repeat(72));
  for (const t of report.tables) {
    const rls = t.rls_enabled === null ? "?" : t.rls_enabled ? "ON " : "OFF";
    const anon =
      t.anon_can_read === null ? " " : t.anon_can_read ? "anon-readable" : "denied";
    const polc = t.policy_count === null ? "?" : String(t.policy_count);
    console.log(
      `  [RLS ${rls}] [${polc} policies] ${anon.padEnd(20)} ${t.table.padEnd(22)} ` +
        `(${t.source})`
    );
    console.log(`      => ${t.recommendation}`);
  }

  console.log("");
  console.log("Views:");
  for (const v of report.views) {
    const inv =
      v.security_invoker === null ? "?" : v.security_invoker ? "invoker" : "definer";
    console.log(`  [${inv.padEnd(7)}] ${v.view}`);
  }

  console.log("");
  console.log("Unrestricted tables:", report.summary.unrestricted_tables.join(", ") || "(none)");
  console.log("RLS without policies:", report.summary.rls_without_policies.join(", ") || "(none)");
  console.log("Suspicious views:   ", report.summary.suspicious_views.join(", ") || "(unknown — install live RPC)");

  console.log("");
  console.log("Wrote:", OUT_PATH);
}

main().catch((err) => {
  console.error("audit-rls failed:", err);
  process.exitCode = 1;
});
