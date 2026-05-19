import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/service";
import { AdminBracketPanel } from "@/components/admin-bracket-panel";
import { AdminGoldenBootPanel } from "@/components/admin-golden-boot-panel";
import { WORLD_CUP_GROUPS } from "@/lib/bracket/groups";

const ROUND_ORDER = ["r32", "r16", "qf", "sf", "final"] as const;

const ROUND_LABEL: Record<(typeof ROUND_ORDER)[number], string> = {
  r32: "1/16 (32 equipos)",
  r16: "1/8 (16 equipos)",
  qf: "Cuartos",
  sf: "Semifinal",
  final: "Final",
};

export default async function AdminBracketPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/app/simulador");

  const supabase = createServiceClient();

  const { data: results } = await supabase
    .from("bracket_results")
    .select("round, position, team")
    .in("round", [...ROUND_ORDER, "champion"])
    .order("position", { ascending: true });

  const { data: goldenBootResult } = await supabase
    .from("golden_boot_result")
    .select("player_id")
    .eq("id", 1)
    .maybeSingle();

  const rounds = ROUND_ORDER.map((round) => ({
    round,
    label: ROUND_LABEL[round],
    matches: [] as {
      id: string;
      position: number;
      team1: string;
      team2: string;
      kickoffAt: string;
      status: string;
      goals1: number | null;
      goals2: number | null;
    }[],
  }));

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#f8f9fa] px-container-margin py-porra-lg md:py-porra-xl">
      <div className="relative mx-auto max-w-6xl space-y-porra-lg">
        <section className="rounded-xl border border-[#dedede] bg-white p-porra-md md:p-porra-lg shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2 max-w-2xl">
              <p className="text-[10px] font-bold tracking-widest text-[#ee7766] uppercase">Panel admin</p>
              <h1 className="text-3xl font-bold text-[#004c84]">Bracket oficial</h1>
              <p className="text-sm text-[#555]">
                Selecciona quién avanza por ronda y fija el campeón oficial. Alimenta el ranking de la porra interna.
              </p>
            </div>
          </div>
        </section>

        <AdminBracketPanel
          rounds={rounds}
          initialResults={results ?? []}
          teamPool={WORLD_CUP_GROUPS.flatMap((g) => g.teams)}
        />

        <AdminGoldenBootPanel initialPlayerId={goldenBootResult?.player_id ?? null} />
      </div>
    </div>
  );
}
