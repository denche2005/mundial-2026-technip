import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { ArrowLeft, Trophy } from "lucide-react";

export default async function ReglasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-container-margin py-porra-lg space-y-porra-md">
      <Link
        href="/app/perfil"
        className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <div className="rounded-xl border border-white/10 bg-surface-container p-porra-md md:p-porra-lg space-y-4">
        <div className="flex items-center gap-2 text-secondary">
          <Trophy className="h-6 w-6" />
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Puntuación (solo cuadro)
          </h1>
        </div>
        <p className="text-body-md text-on-surface-variant">
          En esta porra interna solo cuenta el <strong className="text-on-surface">cuadro eliminatorio</strong>.
          Tus elecciones se comparan con el <strong className="text-on-surface">bracket oficial</strong> que
          configuran los administradores. No hay puntos por marcadores de partidos de fase de grupos.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-body-md text-on-surface-variant">
          <li>
            Por cada equipo que aciertes en la posición correcta de cada ronda (1/16, 1/8, cuartos, semifinal,
            final y campeón) sumas puntos según la tabla definida en la base de datos (<code className="text-xs text-secondary">bracket_round_points</code>).
          </li>
          <li>
            El ranking muestra una sola clasificación global: la suma de tus puntos de cuadro.
          </li>
          <li>
            Puedes editar tu cuadro hasta la fecha de bloqueo configurada en el torneo (campo{" "}
            <code className="text-xs text-secondary">tournament_start_at</code> en Supabase).
          </li>
        </ul>
      </div>
    </div>
  );
}
