import { getSessionUser } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/service";
import { BracketSimulator } from "@/components/bracket-simulator";
import { redirect } from "next/navigation";

export default async function SimuladorPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const service = createServiceClient();

  const { data: predictions } = await service
    .from("bracket_predictions")
    .select("*")
    .eq("user_id", user.id);

  const { data: goldenBoot } = await service
    .from("golden_boot_predictions")
    .select("player_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: config } = await service
    .from("tournament_config")
    .select("*")
    .single();

  const isLocked = config
    ? new Date() >= new Date(config.tournament_start_at)
    : false;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#f8f9fa] px-container-margin py-porra-lg md:py-porra-xl">
      <div className="relative mx-auto mb-6 max-w-6xl">
        <h1 className="text-3xl font-bold text-[#004c84] mb-1">
          Camino a la Final
        </h1>
        <p className="text-sm text-[#555]">
          Arma tu árbol completo y define a tu campeón del Mundial 2026.
        </p>
      </div>
      <div className="relative mx-auto max-w-6xl">
        <BracketSimulator
          predictions={predictions ?? []}
          isLocked={isLocked}
          userName={user.full_name ?? "Jugador"}
          goldenBootPlayerId={goldenBoot?.player_id ?? null}
        />
      </div>
    </div>
  );
}
