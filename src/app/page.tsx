import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  UserPlus,
  CalendarDays,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { Flag } from "@/components/ui/flag";
import { BracketScoringTable } from "@/components/bracket-scoring-table";
import { TechnipLogo } from "@/components/ui/technip-logo";
import { TechnipLogoMark } from "@/components/ui/technip-logo-mark";

const SECTION_LABEL =
  "text-sm sm:text-base font-bold tracking-[0.12em] uppercase";

const STADIUM_HERO =
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80";

const FEATURED_TEAMS = [
  "BRA", "ARG", "ESP", "FRA", "GER", "ENG", "POR", "NED",
  "MEX", "USA", "CAN", "JPN", "MAR", "URU", "BEL", "CRO",
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Fernanda", pts: 87 },
  { rank: 2, name: "Sacha", pts: 82 },
  { rank: 3, name: "Carles", pts: 79 },
  { rank: 4, name: "Edu", pts: 76 },
  { rank: 5, name: "Denys", pts: 73 },
];

export default async function LandingPage() {
  const user = await getSessionUser();

  return (
    <main className="min-h-screen bg-white text-[#1a1a2e] overflow-x-hidden">
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[#dedede] bg-white/90 backdrop-blur-xl sm:h-16 shadow-sm">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-container-margin">
          <div className="flex min-w-0 items-center gap-2">
            <TechnipLogo className="h-7 w-auto sm:h-8" />
            <p className="hidden sm:block text-sm font-bold text-[#004c84]">Mundial 2026</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {!user ? (
              <Link
                href="/register"
                className="whitespace-nowrap rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#555] hover:text-[#0070ef] transition-colors sm:px-3 sm:text-sm"
              >
                Crear cuenta
              </Link>
            ) : null}
            <Link
              href={user ? "/app" : "/login"}
              className="whitespace-nowrap rounded-lg border border-[#0070ef] px-2 py-1.5 text-[11px] font-semibold text-[#0070ef] hover:bg-[#e0efff] transition-colors sm:px-3 sm:text-sm"
            >
              {user ? "Ir a mi porra" : "Iniciar sesión"}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate overflow-hidden pt-16">
        <Image
          src={STADIUM_HERO}
          alt="Estadio del Mundial 2026"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#004c84]/80 via-[#0070ef]/60 to-white" />

        <div className="relative z-10 mx-auto max-w-7xl px-container-margin min-h-[calc(100dvh-4rem)] flex flex-col pb-6 sm:min-h-0 sm:py-14 md:py-20">
          <div className="max-w-3xl flex flex-col justify-center flex-1 sm:flex-none sm:justify-start pt-4 sm:pt-0">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/20 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm mb-3 sm:mb-4">
              PORRA OFICIAL TECHNIP
            </span>

            <h1 className="text-[clamp(1.35rem,2.8vw+0.6rem,2.35rem)] sm:text-[clamp(1.5rem,3.2vw+0.5rem,2.65rem)] leading-[1.12] tracking-tight text-white font-extrabold drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              <span className="block whitespace-nowrap">HAZ TUS PREDICCIONES.</span>
              <span className="mt-1 block whitespace-nowrap text-[#80c7a0]">GANA Y OBTEN PREMIOS.</span>
            </h1>

            <p className="mt-3 sm:mt-4 max-w-xl text-sm sm:text-base font-semibold text-white leading-snug sm:leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
              Rellena el cuadro eliminatorio del Mundial 2026, compite en una sola clasificación global y
              suma puntos cuando tu pronóstico coincide con el bracket oficial.
            </p>

            <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
              <Link
                href={user ? "/app/simulador" : "/register"}
                className="group rounded-xl bg-[#0070ef] px-6 py-3 sm:px-8 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-[0_4px_16px_rgba(0,112,239,0.3)] hover:brightness-105 transition-all duration-300 flex items-center gap-2"
              >
                {user ? "Ir al cuadro" : "Empezar"}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={user ? "/app/ranking" : "/login"}
                className="rounded-xl border-2 border-white/50 px-6 py-3 sm:px-8 sm:py-3.5 text-sm sm:text-base font-bold text-white hover:bg-white/10 transition-all duration-300"
              >
                Ver ranking
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-y border-[#dedede] bg-white/80 backdrop-blur-md py-4 overflow-hidden">
          <div className="flex animate-scroll-x gap-8">
            {[...FEATURED_TEAMS, ...FEATURED_TEAMS].map((code, i) => (
              <div key={`${code}-${i}`} className="flex items-center gap-2 shrink-0">
                <Flag code={code} size="md" rounded="sm" />
                <span className="text-sm font-medium text-[#555] whitespace-nowrap">
                  {code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-container-margin">
        {/* HOW IT WORKS */}
        <section className="py-20 md:py-28">
          <div className="text-center mb-14">
            <span className={`${SECTION_LABEL} text-[#0070ef]`}>3 PASOS SIMPLES</span>
            <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-[#004c84]">
              Cómo Funciona
            </h2>
            <p className="mt-3 text-sm text-[#555] max-w-lg mx-auto">
              Regístrate con email, entra al simulador y guarda tu cuadro antes del cierre.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: UserPlus,
                title: "Crea tu cuenta",
                desc: "Registro con email y contraseña. Acceso solo para participantes Technip.",
                color: "#0070ef",
              },
              {
                icon: CalendarDays,
                title: "Completa el cuadro",
                desc: "Elige equipos por ronda hasta el campeón. Puedes editar hasta el día 10 de junio.",
                color: "#80c7a0",
              },
              {
                icon: Trophy,
                title: "Escala el ranking",
                desc: "Una sola clasificación global. Los puntos se recalculan en tiempo directo.",
                color: "#ee7766",
              },
            ].map((step, idx) => (
              <article
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-[#dedede] bg-white p-8 hover:shadow-lg transition-all duration-300"
              >
                <span className="absolute top-4 right-4 font-display text-[4rem] leading-none font-bold text-[#f0f2f5]">
                  {idx + 1}
                </span>

                <span className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-[#dedede] bg-[#f8f9fa]">
                  <step.icon className="h-7 w-7" style={{ color: step.color }} />
                </span>
                <h3 className="relative font-bold text-xl text-[#1a1a2e]">
                  {step.title}
                </h3>
                <p className="relative mt-3 text-sm text-[#555] leading-relaxed">
                  {step.desc}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* SCORING TABLE */}
        <section className="py-16 md:py-24">
          <div className="text-center mb-12">
            <span className={`${SECTION_LABEL} text-[#80c7a0]`}>SISTEMA DE PUNTOS</span>
            <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-[#004c84]">
              Puntos por ronda
            </h2>
            <p className="mt-3 text-sm text-[#555] max-w-xl mx-auto">
              Cuanto más avanzada la ronda, más puntos por acierto.{" "}
              <span className="whitespace-nowrap">¡Acertar al campeón vale 10!</span>
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <BracketScoringTable />
          </div>
        </section>

        {/* LIVE LEADERBOARD PREVIEW */}
        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className={`${SECTION_LABEL} text-[#ee7766]`}>RANKING EN VIVO</span>
              <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-[#004c84]">
                ¿Puedes llegar al Top 10?
              </h2>
              <p className="mt-4 text-lg text-[#555] leading-relaxed max-w-lg">
                Una sola tabla: compite con el resto de participantes. Los puntos se recalculan en tiempo directo.
              </p>
              <Link
                href={user ? "/app/ranking" : "/register"}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#ee7766]/10 border border-[#ee7766]/30 px-6 py-3 font-bold text-[#ee7766] hover:bg-[#ee7766]/20 transition-all"
              >
                Ver ranking completo
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-[#dedede] bg-white overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-[#dedede] flex items-center justify-between bg-[#f8f9fa]">
                <span className="text-[10px] font-bold tracking-widest text-[#878787] uppercase">Ranking Global</span>
                <span className="flex items-center gap-1.5 text-xs text-[#80c7a0]">
                  <span className="w-2 h-2 rounded-full bg-[#80c7a0] animate-pulse" />
                  En vivo
                </span>
              </div>
              <div className="divide-y divide-[#f0f2f5]">
                {MOCK_LEADERBOARD.map((player) => (
                  <div
                    key={player.rank}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8f9fa] transition-colors"
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${player.rank === 1
                        ? "bg-[#e0efff] text-[#0070ef]"
                        : player.rank === 2
                          ? "bg-[#f0f2f5] text-[#555]"
                          : player.rank === 3
                            ? "bg-[#ffddd8] text-[#ee7766]"
                            : "bg-[#f0f2f5] text-[#878787]"
                        }`}
                    >
                      {player.rank}
                    </span>
                    <TechnipLogoMark size="md" />
                    <span className="flex-1 font-medium text-[#1a1a2e]">{player.name}</span>
                    <span className="font-mono text-sm text-[#80c7a0] font-bold">
                      {player.pts} pts
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-[#f8f9fa] text-center border-t border-[#dedede]">
                <span className="text-sm text-[#878787]">
                  Tu posición: <span className="text-[#0070ef] font-bold">¿?</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 md:py-28">
          <div className="relative rounded-3xl border border-[#0070ef]/20 bg-gradient-to-br from-[#e0efff] via-white to-[#d8f5e6] overflow-hidden p-12 md:p-16 text-center">
            <div className="relative z-10">
              <Trophy className="mx-auto h-12 w-12 text-[#0070ef] mb-6" />
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] leading-tight text-[#004c84] font-bold">
                ¿Listo para la gloria?
              </h2>
              <p className="mt-4 text-lg text-[#555] max-w-lg mx-auto">
                El Mundial 2026 empieza en junio. Crea tu porra hoy y demuestra que sabes más de fútbol que nadie.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href={user ? "/app" : "/register"}
                  className="group rounded-xl bg-[#0070ef] px-10 py-4 font-bold text-white shadow-[0_4px_16px_rgba(0,112,239,0.3)] hover:brightness-105 transition-all duration-300 flex items-center gap-2"
                >
                  Crear mi porra
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="mt-4 text-xs text-[#878787]">
                Se tarda menos de 3 minutos
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#dedede] bg-[#f8f9fa] py-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-2 px-container-margin text-sm text-[#878787]">
          <TechnipLogo className="h-5 w-auto opacity-60" />
          <p>© {new Date().getFullYear()} Technip Energies</p>
        </div>
      </footer>
    </main>
  );
}
