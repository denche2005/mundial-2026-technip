/**
 * Genera src/data/world-cup-2026-squads.json desde Olympics.com (plantillas públicas).
 * Uso: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/build-golden-boot-squads.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE =
  "https://www.olympics.com/en/news/2026-fifa-world-cup-football-teams-squads-players-complete-list";

const TEAM_CODE = {
  mexico: "MEX",
  "south africa": "RSA",
  "republic of korea": "KOR",
  czechia: "CZE",
  canada: "CAN",
  "bosnia and herzegovina": "BIH",
  qatar: "QAT",
  switzerland: "SUI",
  brazil: "BRA",
  morocco: "MAR",
  haiti: "HAI",
  scotland: "SCO",
  "united states of america": "USA",
  paraguay: "PAR",
  australia: "AUS",
  türkiye: "TUR",
  germany: "GER",
  curaçao: "CUW",
  curacao: "CUW",
  "côte d'ivoire": "CIV",
  "cote d'ivoire": "CIV",
  ecuador: "ECU",
  netherlands: "NED",
  japan: "JPN",
  sweden: "SWE",
  tunisia: "TUN",
  belgium: "BEL",
  egypt: "EGY",
  "islamic republic of iran": "IRN",
  iran: "IRN",
  "new zealand": "NZL",
  spain: "ESP",
  "cabo verde": "CPV",
  "saudi arabia": "KSA",
  uruguay: "URU",
  france: "FRA",
  senegal: "SEN",
  iraq: "IRQ",
  norway: "NOR",
  argentina: "ARG",
  algeria: "ALG",
  austria: "AUT",
  jordan: "JOR",
  portugal: "POR",
  "democratic republic of the congo": "COD",
  uzbekistan: "UZB",
  colombia: "COL",
  england: "ENG",
  croatia: "CRO",
  ghana: "GHA",
  panama: "PAN",
};

const SKIP_TITLES = new Set([
  "goalkeepers",
  "defenders",
  "midfielders",
  "forwards",
  "midfielders & forwards",
]);

function decodeHtml(s) {
  return s
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

function normalizeTeamName(raw) {
  return decodeHtml(raw)
    .toLowerCase()
    .replace(/\s*\(.*\)\s*$/, "")
    .trim();
}

function extractNames(chunk) {
  const names = [];
  const re =
    /([A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F\s.'\-]*?)\s*\([^)]+\)/g;
  let m;
  while ((m = re.exec(chunk)) !== null) {
    const name = m[1].trim().replace(/\s+/g, " ");
    if (name.length >= 3 && !SKIP_TITLES.has(name.toLowerCase())) names.push(name);
  }
  if (names.length === 0) {
    const loose = /([A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F\s.'\-]{2,40})/g;
    while ((m = loose.exec(chunk)) !== null) {
      const name = m[1].trim();
      if (!SKIP_TITLES.has(name.toLowerCase()) && !/^(Group|FIFA|World|Cup)$/i.test(name)) {
        names.push(name);
      }
    }
  }
  return names;
}

function parseBlock(block) {
  const titleMatch = block.match(/<strong>([^<]+)<\/strong>/i);
  if (!titleMatch) return null;
  const teamName = normalizeTeamName(titleMatch[1]);
  if (SKIP_TITLES.has(teamName)) return null;
  const code = TEAM_CODE[teamName];
  if (!code) return null;

  const plain = decodeHtml(block.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " "));
  const sections = plain.split(
    /(?:Goalkeepers|Defenders|Midfielders(?:\s*&\s*forwards)?|Forwards)\s*:/gi
  );
  const players = new Set();
  for (let i = 1; i < sections.length; i++) {
    for (const n of extractNames(sections[i])) players.add(n);
  }
  return players.size > 0 ? { code, players: [...players] } : null;
}

function parseSquadsFromHtml(html) {
  const squads = {};
  const blocks = html.split(/<h3[^>]*>/i).slice(1);
  for (const block of blocks) {
    const parsed = parseBlock(block);
    if (!parsed) continue;
    const existing = new Set(squads[parsed.code] ?? []);
    for (const p of parsed.players) existing.add(p);
    squads[parsed.code] = [...existing].sort((a, b) => a.localeCompare(b, "es"));
  }
  return squads;
}

async function main() {
  console.log("Descargando", SOURCE);
  const res = await fetch(SOURCE, {
    headers: { "User-Agent": "mundial-2026-technip/1.0 (squad builder)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const squads = parseSquadsFromHtml(await res.text());

  const fallbackPath = join(process.cwd(), "src", "data", "squad-fallback.json");
  try {
    const fallback = JSON.parse(readFileSync(fallbackPath, "utf8")).squads ?? {};
    for (const [code, names] of Object.entries(fallback)) {
      const set = new Set(squads[code] ?? []);
      for (const n of names) set.add(n);
      squads[code] = [...set].sort((a, b) => a.localeCompare(b, "es"));
    }
  } catch {
    console.warn("Sin squad-fallback.json — solo datos Olympics");
  }

  const outDir = join(process.cwd(), "src", "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "world-cup-2026-squads.json");
  writeFileSync(outPath, JSON.stringify({ updatedAt: new Date().toISOString(), squads }, null, 2));
  const total = Object.values(squads).reduce((n, arr) => n + arr.length, 0);
  console.log(`OK: ${Object.keys(squads).length} selecciones, ${total} jugadores → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
