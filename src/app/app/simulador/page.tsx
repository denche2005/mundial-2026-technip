import { getSessionUser } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/service";
import { BracketSimulator } from "@/components/bracket-simulator";
import { redirect } from "next/navigation";

export default async function SimuladorPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  // Sesión por cookie (sin JWT Supabase): el cliente anon no pasa RLS de
  // bracket_predictions. Tras verificar sesión, leemos solo las filas del usuario.
  const service = createServiceClient();

  const { data: predictions } = await service
    .from("bracket_predictions")
    .select("*")
    .eq("user_id", user.id);

  const { data: config } = await service
    .from("tournament_config")
    .select("*")
    .single();

  const isLocked = config
    ? new Date() >= new Date(config.tournament_start_at)
    : false;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-primary-container px-container-margin py-porra-lg md:py-porra-xl">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-15"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80)",
        }}
      />
      <div className="relative mx-auto mb-6 max-w-6xl">
        <h1 className="font-display-lg text-display-lg text-on-background mb-1">
          Camino a la Final
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Arma tu árbol completo y define a tu campeón del Mundial 2026.
        </p>
      </div>
      <div className="relative mx-auto max-w-6xl">
        <BracketSimulator
          predictions={predictions ?? []}
          isLocked={isLocked}
          userName={user.full_name ?? "Jugador"}
        />
      </div>
    </div>
  );
}
