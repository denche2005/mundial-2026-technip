import { NextResponse } from "next/server";
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

type Pick = { position: number; team: string };

export async function POST(request: Request) {
    try {
        const user = await requireSessionUser();
        if (user.role !== "admin") {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
        }

        const body = (await request.json().catch(() => null)) as
            | { round?: BracketRound; picks?: Pick[] }
            | null;

        const round = body?.round;
        const picks = Array.isArray(body?.picks) ? body!.picks! : [];

        if (!round || !ALLOWED_ROUNDS.has(round)) {
            return NextResponse.json({ success: false, error: "Ronda inválida" }, { status: 400 });
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
                round,
                position: round === "champion" ? p.position : p.position + 100,
                team: p.team.trim().toUpperCase(),
            }));

        const supabase = createServiceClient();

        const { error: deleteError } = await supabase
            .from("bracket_results")
            .delete()
            .eq("round", round);

        if (deleteError) {
            return NextResponse.json(
                { success: false, error: `No se pudo actualizar la ronda: ${deleteError.message}` },
                { status: 500 }
            );
        }

        if (sanitized.length > 0) {
            const { error: insertError } = await supabase
                .from("bracket_results")
                .insert(sanitized);

            if (insertError) {
                return NextResponse.json(
                    { success: false, error: `No se pudo guardar la ronda: ${insertError.message}` },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error inesperado";
        if (message === "UNAUTHENTICATED") {
            return NextResponse.json({ success: false, error: "Debes iniciar sesión." }, { status: 401 });
        }

        return NextResponse.json(
            { success: false, error: "No se pudo guardar el bracket." },
            { status: 500 }
        );
    }
}