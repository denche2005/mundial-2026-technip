import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/service";
import { BracketSimulator } from "@/components/bracket-simulator";

export default async function UsuarioBracketPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const viewer = await getSessionUser();
  if (!viewer) redirect("/login");

  const { userId } = await params;
  const service = createServiceClient();

  const { data: profile } = await service
    .from("profiles")
    .select("id, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) notFound();

  const { data: predictions } = await service
    .from("bracket_predictions")
    .select("*")
    .eq("user_id", userId);

  const { data: goldenBoot } = await service
    .from("golden_boot_predictions")
    .select("player_id")
    .eq("user_id", userId)
    .maybeSingle();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#f8f9fa] px-container-margin py-porra-lg md:py-porra-xl">
      <div className="relative mx-auto mb-6 max-w-6xl space-y-3">
        <Link
          href="/app/ranking"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#555] hover:text-[#0070ef]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al ranking
        </Link>
        <h1 className="text-3xl font-bold text-[#004c84]">
          Cuadro de {profile.full_name ?? "Participante"}
        </h1>
        <p className="text-sm text-[#555]">
          Predicción compartida en la porra interna. Solo lectura.
        </p>
      </div>
      <div className="relative mx-auto max-w-6xl">
        <BracketSimulator
          predictions={predictions ?? []}
          isLocked={false}
          readOnly
          userName={profile.full_name ?? "Jugador"}
          goldenBootPlayerId={goldenBoot?.player_id ?? null}
        />
      </div>
    </div>
  );
}

