"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeInternalPath } from "@/lib/auth-redirect";
import { cookiePathForApp, withPublicBasePath } from "@/lib/base-path";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, encoded: string) {
  const [salt, expected] = encoded.split(":");
  if (!salt || !expected) return false;
  const computed = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return timingSafeEqual(Buffer.from(computed, "utf8"), Buffer.from(expected, "utf8"));
}

function supabaseErrText(err: unknown): string {
  if (err == null) return "error desconocido";
  const parts: string[] = [];
  let cur: unknown = err;
  for (let i = 0; i < 6 && cur != null; i += 1) {
    if (cur instanceof Error) {
      parts.push(cur.message);
      cur = cur.cause;
      continue;
    }
    if (typeof cur === "object") {
      const o = cur as Record<string, unknown>;
      if (typeof o.message === "string") parts.push(o.message);
      if ("cause" in o) {
        cur = o.cause;
        continue;
      }
    }
    break;
  }
  let text = parts.filter(Boolean).join(" — ");
  if (!text) text = String(err);

  if (/issuer certificate|UNABLE_TO_GET_ISSUER|fetch failed/i.test(text)) {
    text +=
      " [TLS/proxy: en local usa npm run dev:insecure-tls (solo desarrollo) o NODE_EXTRA_CA_CERTS con el PEM corporativo]";
  }
  return text;
}

export async function loginWithPassword(
  email: string,
  password: string,
  next?: string
) {
  try {
    const supabase = createServiceClient();
    const redirectTo = withPublicBasePath(sanitizeInternalPath(next));
    const { data: byEmail, error: byEmailError } = await supabase
      .from("profiles")
      .select("id, password_hash")
      .eq("email", email)
      .maybeSingle();

    if (byEmailError && byEmailError.code !== "PGRST116") {
      return { error: `Error al buscar perfil: ${supabaseErrText(byEmailError)}` };
    }
    if (!byEmail) return { error: "No existe una cuenta con este email. Regístrate primero." };
    if (!byEmail.password_hash) {
      return {
        error:
          "Esta cuenta no tiene contraseña configurada en el registro interno. Contacta al administrador.",
      };
    }
    if (!verifyPassword(password, byEmail.password_hash)) return { error: "Contraseña incorrecta." };

    const cookieStore = await cookies();
    const isSecure = process.env.NODE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https://")
      : false;

    cookieStore.set("session_user", byEmail.id, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      path: cookiePathForApp(),
    });

    return { redirectTo };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error inesperado en login.",
    };
  }
}

export async function registerWithPassword(
  email: string,
  password: string,
  fullName: string,
  next?: string
) {
  try {
    const supabase = createServiceClient();
    const redirectTo = withPublicBasePath(sanitizeInternalPath(next));
    const name = (fullName.trim() || email.split("@")[0]).slice(0, 80);
    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existingError) {
      return { error: `Error validando cuenta: ${supabaseErrText(existingError)}` };
    }
    if (existing) return { error: "Ya existe una cuenta con este email. Inicia sesión." };

    const password_hash = hashPassword(password);
    const { data: created, error } = await supabase
      .from("profiles")
      .insert({ email, full_name: name, password_hash })
      .select("id")
      .single();
    if (error || !created) {
      return { error: `Error creando cuenta: ${supabaseErrText(error ?? null)}` };
    }

    const cookieStore = await cookies();
    const isSecure = process.env.NODE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https://")
      : false;

    cookieStore.set("session_user", created.id, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      path: cookiePathForApp(),
    });

    return { redirectTo };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error inesperado en registro.",
    };
  }
}

export async function logout() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore
  }

  const cookieStore = await cookies();
  cookieStore.set("session_user", "", {
    httpOnly: true,
    path: cookiePathForApp(),
    maxAge: 0,
  });
  redirect("/");
}
