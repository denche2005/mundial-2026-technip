import { createClient } from "@supabase/supabase-js";

/** Quita espacios/BOM y comillas típicas al copiar desde el portapapeles. */
function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  let v = value.trim().replace(/^\uFEFF/, "");
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

export function createServiceClient() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en variables de entorno.");
  }
  if (!serviceKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en variables de entorno.");
  }
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL debe empezar por https:// (revisa .env.local sin espacios ni saltos raros)."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
