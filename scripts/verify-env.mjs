/**
 * Comprueba que existan las variables mínimas para Supabase y sitio público.
 * Lee `.env.local` en la raíz del repo (no commitear secretos).
 *
 * Uso: npm run verify:env
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const recommended = ["NEXT_PUBLIC_SITE_URL"];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const text = fs.readFileSync(filePath, "utf8");
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = parseEnvFile(envPath);
const missing = required.filter((k) => !env[k]?.trim());
const missingRec = recommended.filter((k) => !env[k]?.trim());

console.log("=== verify:env ===\n");
if (!fs.existsSync(envPath)) {
  console.error("No existe .env.local. Copia .env.local.example → .env.local y rellena valores.\n");
  process.exit(1);
}

if (missing.length) {
  console.error("Faltan variables obligatorias en .env.local:");
  for (const k of missing) console.error("  -", k);
  console.error("");
  process.exitCode = 1;
} else {
  console.log("Variables Supabase obligatorias: OK");
}

if (missingRec.length) {
  console.warn("Recomendado (enlaces / cookies seguras en prod):");
  for (const k of missingRec) console.warn("  -", k);
  console.warn("");
}

if (!/^https:\/\//i.test(env.NEXT_PUBLIC_SUPABASE_URL || "")) {
  console.warn(
    "Aviso: NEXT_PUBLIC_SUPABASE_URL debería ser https://… (ver src/lib/supabase/service.ts).\n",
  );
}

console.log(`
TLS corporativo (dev local):
  - Preferido: NODE_EXTRA_CA_CERTS=ruta\\corp.pem npm run dev
  - Solo desarrollo: npm run dev:insecure-tls -- --port 3000

Migraciones Supabase (proyecto remoto):
  supabase link --project-ref <ref>
  supabase db push
`);

if (missing.length) process.exit(1);
