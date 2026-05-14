"use server";

import { requireSessionUser } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/service";
import { logEvent } from "@/lib/events";
import { revalidatePath } from "next/cache";

const VALID_ROUNDS = new Set(["r32", "r16", "qf", "sf", "final", "champion"]);

/**
 * Replace the user's full bracket with the new picks.
 *
 * Legacy cookie sessions use the Supabase **anon** DB role (no JWT), so RLS
 * policies granted only to `authenticated` block RPC/table writes. We use the
 * service role here only after `requireSessionUser()` — all rows are scoped to
 * `user.id` from that verified session.
 */
export async function saveBracketPredictions(
  picks: { round: string; position: number; team: string }[]
) {
  let user;
  try {
    user = await requireSessionUser();
  } catch {
    return { error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  let service;
  try {
    service = createServiceClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await logEvent("bracket_save_failed", { reason: msg }, user.id);
    return { error: "Configuración del servidor incompleta. Contacta soporte." };
  }

  const { data: config } = await service
    .from("tournament_config")
    .select("tournament_start_at")
    .maybeSingle();

  if (config && new Date(config.tournament_start_at) <= new Date()) {
    return { error: "El bracket está bloqueado — el torneo ya ha comenzado" };
  }

  const sanitized = picks.filter(
    (p) =>
      VALID_ROUNDS.has(p.round) &&
      Number.isInteger(p.position) &&
      typeof p.team === "string" &&
      p.team.length > 0
  );

  const { error: delErr } = await service
    .from("bracket_predictions")
    .delete()
    .eq("user_id", user.id);

  if (delErr) {
    await logEvent(
      "bracket_save_failed",
      { reason: delErr.message, phase: "delete" },
      user.id
    );
    return { error: "No se pudo guardar el bracket. Inténtalo de nuevo." };
  }

  if (sanitized.length > 0) {
    const { error: insErr } = await service.from("bracket_predictions").insert(
      sanitized.map((p) => ({
        user_id: user.id,
        round: p.round,
        position: p.position,
        team: p.team,
        updated_at: new Date().toISOString(),
      }))
    );
    if (insErr) {
      await logEvent(
        "bracket_save_failed",
        { reason: insErr.message, phase: "insert" },
        user.id
      );
      return { error: "No se pudo guardar el bracket. Inténtalo de nuevo." };
    }
  }

  revalidatePath("/app/ranking");
  return { success: true };
}
