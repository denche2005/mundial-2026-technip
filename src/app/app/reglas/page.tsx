import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { ArrowLeft, Trophy } from "lucide-react";
import { BracketScoringTable } from "@/components/bracket-scoring-table";

export default async function ReglasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-container-margin py-porra-lg space-y-6">
      <Link
        href="/app/simulador"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#555] hover:text-[#0070ef]"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <div className="rounded-2xl border border-[#dedede] bg-gradient-to-br from-white via-[#fafbfd] to-[#f0f6ff] p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#dedede] bg-white shadow-sm">
            <Trophy className="h-6 w-6 text-[#0070ef]" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] font-bold tracking-widest text-[#80c7a0] uppercase">
              Sistema de puntos
            </p>
            <h1 className="text-2xl font-bold text-[#004c84] leading-tight">
              Puntuación (solo cuadro)
            </h1>
          </div>
        </div>

        <p className="text-left text-sm leading-relaxed text-[#555]">
          En esta porra interna solo cuenta el <strong className="text-[#1a1a2e]">cuadro eliminatorio</strong>.
          Tus elecciones se comparan con el <strong className="text-[#1a1a2e]">bracket oficial</strong> que
          configuran los administradores. No hay puntos por marcadores de partidos de fase de grupos.
        </p>

        <ul className="list-disc space-y-2 pl-5 text-left text-sm text-[#555] leading-relaxed">
          <li>
            Por cada equipo que aciertes en la posición correcta de cada ronda sumas los puntos indicados en la
            tabla siguiente (misma lógica que en la página de inicio).
          </li>
          <li>
            El ranking muestra una sola clasificación global: la suma de tus puntos de cuadro.
          </li>
          <li>
            Puedes editar tu cuadro hasta la fecha de bloqueo configurada en el torneo (campo{" "}
            <code className="text-xs text-[#0070ef]">tournament_start_at</code> en Supabase).
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <div className="text-left">
          <h2 className="text-lg font-bold text-[#004c84]">Puntos por ronda</h2>
          <p className="mt-1 text-sm text-[#555]">
            Cuanto más avanzada la ronda, más puntos por acierto. Acertar al campeón vale 10 puntos.
          </p>
        </div>
        <BracketScoringTable />
      </div>
    </div>
  );
}
