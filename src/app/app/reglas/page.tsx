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
              Cómo funciona
            </h1>
          </div>
        </div>

        <div className="space-y-4 text-left text-sm leading-relaxed text-[#555]">
          <p>
            Obtén puntos por adivinar equipos en el{" "}
            <strong className="text-[#1a1a2e]">cuadro eliminatorio</strong>.
          </p>
          <ol className="list-decimal space-y-2.5 pl-5">
            <li>
              Ordena los equipos de cada grupo (quién queda{" "}
              <strong className="text-[#1a1a2e]">1.º, 2.º, 3.º y 4.º</strong>).
            </li>
            <li>
              A partir de estas predicciones se genera el{" "}
              <strong className="text-[#1a1a2e]">cuadro de rondas eliminatorias</strong>.
            </li>
            <li>
              Eliges <strong className="text-[#1a1a2e]">quién avanza</strong> en cada ronda hasta el campeón.
            </li>
            <li>
              Conforme va avanzando el torneo, los administradores marcan las selecciones clasificadas. Recibes{" "}
              <strong className="text-[#1a1a2e]">puntos por cada acierto</strong> en cada ronda.
            </li>
          </ol>
          <p>
            El <strong className="text-[#1a1a2e]">ranking</strong> es una sola clasificación: la suma de todos tus
            aciertos. Puedes cambiar tu cuadro las veces que quieras hasta antes del inicio del torneo.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-left">
          <h2 className="text-lg font-bold text-[#004c84]">Puntos por ronda</h2>
          <p className="mt-1 text-sm text-[#555]">
            Desglose de cuántos puntos suma cada acierto según la ronda.
          </p>
        </div>
        <BracketScoringTable />
      </div>
    </div>
  );
}
