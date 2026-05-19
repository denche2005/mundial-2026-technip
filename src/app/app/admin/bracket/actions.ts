"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUser } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/service";

type BracketRound = "r32" | "r16" | "qf" | "sf" | "final" | "champion";

const ALLOWED_ROUNDS = new Set<BracketRound>([
    "r32",
    "r16",
    "qf",
    "sf",
    "final",
    "champion",
]);

async function requireAdmin() {
    const user = await requireSessionUser();
    if (user.role !== "admin") throw new Error("FORBIDDEN");
    return user;
}

export async function saveBracketRound(
    round: BracketRound,
    picks: { position: number; team: string }[]
) {
    try {
        await requireAdmin();
    } catch {
        return { error: "No autorizado" };
    }

    if (!ALLOWED_ROUNDS.has(round)) {
        return { error: "Ronda inválida" };
    }

    const sanitized = picks
        .filter(
            (p) =>
                Number.isInteger(p.position) &&
                p.position > 0 &&
                typeof p.team === "string" &&
                p.team.trim().length > 0
        )
        .map((p) => ({
            // Keep admin results aligned with simulator winner positions (101+).
            position: round === "champion" ? p.position : p.position + 100,
            team: p.team.trim().toUpperCase(),
        }));

    const supabase = createServiceClient();

    const { error: deleteError } = await supabase
        .from("bracket_results")
        .delete()
        .eq("round", round);

    if (deleteError) {
        console.error("saveBracketRound: delete failed", { round, message: deleteError.message });
        return { error: "No se pudo actualizar la ronda" };
    }

    if (sanitized.length > 0) {
        const { error: insertError } = await supabase.from("bracket_results").insert(
            sanitized.map((p) => ({
                round,
                position: p.position,
                team: p.team,
            }))
        );

        if (insertError) {
            console.error("saveBracketRound: insert failed", {
                round,
                message: insertError.message,
                code: insertError.code,
            });
            return { error: "No se pudo guardar la ronda" };
        }
    }

    revalidatePath("/app/admin/bracket", "page");
    revalidatePath("/app/ranking", "page");
    revalidatePath("/app/simulador", "page");
    revalidatePath("/app", "layout");

    return { success: true };
}

export async function saveGoldenBootResult(playerId: string) {
    try {
        await requireAdmin();
    } catch {
        return { error: "No autorizado" };
    }

    const id = playerId.trim();
    if (!id) return { error: "Selecciona el goleador oficial." };

    const supabase = createServiceClient();
    const { error } = await supabase
        .from("golden_boot_result")
        .upsert(
            { id: 1, player_id: id, updated_at: new Date().toISOString() },
            { onConflict: "id" }
        );

    if (error) {
        return { error: "No se pudo guardar el goleador oficial." };
    }

    revalidatePath("/app/admin/bracket", "page");
    revalidatePath("/app/ranking", "page");
    return { success: true };
}
