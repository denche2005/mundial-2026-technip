import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  UserPlus,
  CalendarDays,
  Share2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Users,
  Target,
  Zap,
  Globe,
  Star,
} from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { Flag } from "@/components/ui/flag";

/* -------------------------------------------------------------------------- */
/*  Static data for the landing page                                           */
/* -------------------------------------------------------------------------- */

const STADIUM_HERO =
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80";

const FEATURED_TEAMS = [
  "BRA", "ARG", "ESP", "FRA", "GER", "ENG", "POR", "NED",
  "MEX", "USA", "CAN", "JPN", "MAR", "URU", "BEL", "CRO",
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Carlos M.", pts: 87, team: "ARG" },
  { rank: 2, name: "Laura G.", pts: 82, team: "ESP" },
  { rank: 3, name: "André S.", pts: 79, team: "BRA" },
  { rank: 4, name: "Mía R.", pts: 76, team: "MEX" },
  { rank: 5, name: "Tom W.", pts: 73, team: "ENG" },
];

// City grid in the exact order of the official FIFA 4×4 image
const HOST_CITIES = [
  { name: "Atlanta", col: 0, row: 0 },
  { name: "Boston", col: 1, row: 0 },
  { name: "Dallas", col: 2, row: 0 },
  { name: "Guadalajara", col: 3, row: 0 },
  { name: "Houston", col: 0, row: 1 },
  { name: "Kansas City", col: 1, row: 1 },
  { name: "Los Angeles", col: 2, row: 1 },
  { name: "CDMX", col: 3, row: 1 },
  { name: "Miami", col: 0, row: 2 },
  { name: "Monterrey", col: 1, row: 2 },
  { name: "New York", col: 2, row: 2 },
  { name: "Philadelphia", col: 3, row: 2 },
  { name: "San Francisco", col: 0, row: 3 },
  { name: "Seattle", col: 1, row: 3 },
  { name: "Toronto", col: 2, row: 3 },
  { name: "Vancouver", col: 3, row: 3 },
];

const SCORING_RULES = [
  {
    label: "Solo cuadro",
    pts: "Por ronda",
    icon: Trophy,
    desc: "Cada acierto en el cuadro eliminatorio (respecto al bracket oficial) suma según la ronda. No hay puntos por marcadores de partidos.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Page component                                                             */
/* -------------------------------------------------------------------------- */

export default async function LandingPage() {
  const user = await getSessionUser();

  return (
    <main className="min-h-screen bg-background text-on-background overflow-x-hidden">
      {/* ─── STICKY NAV ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/10 bg-background/80 backdrop-blur-xl sm:h-16">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-container-margin">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <Trophy className="h-4 w-4 shrink-0 text-secondary sm:h-5 sm:w-5" />
            <p className="truncate whitespace-nowrap font-headline text-xs font-bold uppercase tracking-[0.12em] text-secondary sm:text-headline-md sm:normal-case sm:tracking-normal">
              Technip · Mundial 2026
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {!user ? (
              <Link
                href="/register"
                className="whitespace-nowrap rounded-lg px-2 py-1.5 text-[11px] font-semibold text-on-background hover:text-secondary transition-colors sm:px-3 sm:text-sm"
              >
                Crear cuenta
              </Link>
            ) : null}
            <Link
              href={user ? "/app" : "/login"}
              className="whitespace-nowrap rounded-lg border border-secondary/35 px-2 py-1.5 text-[11px] font-semibold text-secondary hover:bg-secondary/10 transition-colors sm:px-3 sm:text-sm"
            >
              {user ? "Ir a mi porra" : "Iniciar sesión"}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative isolate overflow-hidden pt-16">
        <Image
          src={STADIUM_HERO}
          alt="Estadio del Mundial 2026 por la noche"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-[#0d1b2a]/85 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />

        {/* Animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-tertiary/8 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-container-margin py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/5 px-4 py-1.5 text-label-caps text-secondary backdrop-blur-md mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              PORRA INTERNA TECHNIP
            </span>

            <h1 className="font-display-lg text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight text-on-background">
              ARMA TU CUADRO.
              <br />
              <span className="text-secondary">SUBE EN EL RANKING.</span>
            </h1>

            <p className="mt-6 max-w-xl font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Rellena el cuadro eliminatorio del Mundial 2026, compite en una sola clasificación global y
              suma puntos cuando tu pronóstico coincide con el bracket oficial.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={user ? "/app/simulador" : "/register"}
                className="group relative rounded-xl bg-secondary px-8 py-4 font-headline-sm text-headline-sm text-on-secondary shadow-[0_0_30px_rgba(255,185,85,0.3)] hover:shadow-[0_0_50px_rgba(255,185,85,0.4)] hover:brightness-105 transition-all duration-300 flex items-center gap-2"
              >
                {user ? "Ir al cuadro" : "Registrarse"}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={user ? "/app/ranking" : "/login"}
                className="rounded-xl border-2 border-secondary/40 px-8 py-4 font-headline-sm text-headline-sm text-secondary hover:bg-secondary/10 hover:border-secondary/60 transition-all duration-300"
              >
                Ver ranking
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["ARG", "ESP", "BRA", "MEX", "FRA"].map((code) => (
                  <div
                    key={code}
                    className="w-8 h-8 rounded-full border-2 border-background overflow-hidden"
                  >
                    <Flag code={code} size="md" rounded="full" className="w-full h-full" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-on-background">+6,999 jugadores activos</p>
                <p className="text-xs text-on-surface-variant">De 30+ países compitiendo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling team flags ticker */}
        <div className="relative z-10 border-y border-white/5 bg-background/40 backdrop-blur-md py-4 overflow-hidden">
          <div className="flex animate-scroll-x gap-8">
            {[...FEATURED_TEAMS, ...FEATURED_TEAMS].map((code, i) => (
              <div key={`${code}-${i}`} className="flex items-center gap-2 shrink-0">
                <Flag code={code} size="md" rounded="sm" />
                <span className="text-sm font-medium text-on-surface-variant whitespace-nowrap">
                  {code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-container-margin">
        {/* ─── HOW IT WORKS ─── */}
        <section className="py-20 md:py-28">
          <div className="text-center mb-14">
            <span className="text-label-caps text-secondary tracking-widest">3 PASOS SIMPLES</span>
            <h2 className="mt-3 font-headline-lg text-[clamp(1.75rem,4vw,2.5rem)] text-on-background">
              Cómo Funciona
            </h2>
            <p className="mt-3 text-body-md text-on-surface-variant max-w-lg mx-auto">
              Regístrate con email, entra al simulador y guarda tu cuadro antes del cierre.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: UserPlus,
                title: "Crea tu cuenta",
                desc: "Registro con email y contraseña. Acceso solo para participantes Technip.",
                color: "secondary",
                glow: "rgba(255,185,85,0.15)",
              },
              {
                icon: CalendarDays,
                title: "Completa el cuadro",
                desc: "Elige equipos por ronda hasta el campeón. Puedes editar mientras el torneo no esté bloqueado.",
                color: "tertiary",
                glow: "rgba(89,222,155,0.15)",
              },
              {
                icon: Trophy,
                title: "Escala el ranking",
                desc: "Una sola clasificación global. Los puntos vienen solo de aciertos en el cuadro respecto al oficial.",
                color: "secondary",
                glow: "rgba(255,185,85,0.15)",
              },
            ].map((step, idx) => (
              <article
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface-container p-8 hover:border-white/10 transition-all duration-300"
              >
                {/* Glow */}
                <div
                  className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: step.glow }}
                />
                {/* Step number */}
                <span className="absolute top-4 right-4 font-display text-[4rem] leading-none font-bold text-white/[0.03]">
                  {idx + 1}
                </span>

                <span className={`relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-primary-container`}>
                  <step.icon className={`h-7 w-7 text-${step.color}`} />
                </span>
                <h3 className="relative font-headline-md text-headline-md text-on-background">
                  {step.title}
                </h3>
                <p className="relative mt-3 text-body-md text-on-surface-variant leading-relaxed">
                  {step.desc}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ─── SCORING SYSTEM ─── */}
        <section className="py-16 md:py-24">
          <div className="rounded-2xl border border-white/5 bg-surface-container overflow-hidden">
            <div className="p-8 md:p-12">
              <span className="text-label-caps text-secondary tracking-widest">SISTEMA DE PUNTOS</span>
              <h2 className="mt-3 font-headline-lg text-headline-lg text-on-background">
                ¿Cómo se puntúa?
              </h2>
              <p className="mt-3 text-body-md text-on-surface-variant max-w-2xl">
                Solo cuenta el cuadro eliminatorio frente al bracket oficial. Los detalles por ronda están en la app (página Reglas).
              </p>
            </div>
            <div className="grid grid-cols-1 border-t border-white/5">
              {SCORING_RULES.map((rule) => (
                <div
                  key={rule.label}
                  className="p-8 md:p-10 border-b md:border-b-0 md:border-r last:border-r-0 border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <rule.icon className="h-6 w-6 text-secondary mb-4" />
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-display text-[2.5rem] leading-none font-bold text-secondary">
                      {rule.pts}
                    </span>
                    <span className="text-sm text-on-surface-variant">
                      {typeof rule.pts === "number" ? "puntos" : "tabla en Supabase"}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-background">
                    {rule.label}
                  </h3>
                  <p className="mt-2 text-body-md text-on-surface-variant">
                    {rule.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── LIVE LEADERBOARD PREVIEW ─── */}
        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-label-caps text-tertiary tracking-widest">RANKING EN VIVO</span>
              <h2 className="mt-3 font-headline-lg text-[clamp(1.75rem,4vw,2.5rem)] text-on-background">
                ¿Puedes llegar al Top 10?
              </h2>
              <p className="mt-4 text-body-lg text-on-surface-variant leading-relaxed max-w-lg">
                Una sola tabla: compite con el resto de participantes. Los puntos se recalculan cuando los admins
                actualizan el bracket oficial.
              </p>
              <Link
                href={user ? "/app/ranking" : "/register"}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-tertiary/10 border border-tertiary/30 px-6 py-3 font-headline-sm text-headline-sm text-tertiary hover:bg-tertiary/20 transition-all"
              >
                Ver ranking completo
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Mock leaderboard */}
            <div className="rounded-2xl border border-white/10 bg-surface-container overflow-hidden shadow-[0_0_60px_rgba(89,222,155,0.08)]">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-label-caps text-on-surface-variant">Ranking Global</span>
                <span className="flex items-center gap-1.5 text-xs text-tertiary">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                  En vivo
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {MOCK_LEADERBOARD.map((player) => (
                  <div
                    key={player.rank}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm ${player.rank === 1
                        ? "bg-secondary/20 text-secondary"
                        : player.rank === 2
                          ? "bg-white/10 text-on-surface"
                          : player.rank === 3
                            ? "bg-orange-900/30 text-orange-400"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                    >
                      {player.rank}
                    </span>
                    <Flag code={player.team} size="sm" />
                    <span className="flex-1 font-medium text-on-surface">{player.name}</span>
                    <span className="font-data-mono text-data-mono text-secondary">
                      {player.pts} pts
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-surface-container-low text-center">
                <span className="text-sm text-on-surface-variant">
                  Tu posición: <span className="text-secondary font-bold">¿?</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOST CITY THEMES ─── */}
        <section className="py-16 md:py-24">
          <div className="text-center mb-10">
            <span className="text-label-caps text-secondary tracking-widest">PERSONALIZACIÓN</span>
            <h2 className="mt-3 font-headline-lg text-[clamp(1.75rem,4vw,2.5rem)] text-on-background">
              Elige los colores de tu ciudad
            </h2>
            <p className="mt-3 text-body-md text-on-surface-variant max-w-lg mx-auto">
              16 ciudades sede, 16 paletas únicas. Personaliza la app entera.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-1 sm:gap-1.5 max-w-xl mx-auto">
            {HOST_CITIES.map((city) => {
              const x = city.col === 0 ? "0%" : city.col === 3 ? "100%" : `${(city.col / 3) * 100}%`;
              const y = city.row === 0 ? "0%" : city.row === 3 ? "100%" : `${(city.row / 3) * 100}%`;
              return (
                <div
                  key={city.name}
                  className="group relative aspect-square rounded-lg overflow-hidden cursor-default hover:scale-[1.06] transition-transform duration-200 shadow-sm"
                  style={{
                    backgroundImage: "url(/fifa-cities-grid.jpg)",
                    backgroundSize: "401.5% 401.5%",
                    backgroundPosition: `${x} ${y}`,
                    backgroundRepeat: "no-repeat",
                    filter: "brightness(1.12) saturate(1.2) contrast(1.05)",
                    imageRendering: "auto" as React.CSSProperties["imageRendering"],
                  }}
                  title={city.name}
                >
                  {/* Subtle hover brightening */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200 rounded-lg" />
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={user ? "/app/reglas" : "/register"}
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
            >
              Cómo se puntúa el cuadro
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ─── FEATURES GRID ─── */}
        <section className="py-16 md:py-24">
          <div className="text-center mb-12">
            <span className="text-label-caps text-secondary tracking-widest">CARACTERÍSTICAS</span>
            <h2 className="mt-3 font-headline-lg text-[clamp(1.75rem,4vw,2.5rem)] text-on-background">
              Todo lo que necesitas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Target, title: "Cuadro eliminatorio", desc: "R32, octavos, cuartos, semifinal, final y campeón. Misma lógica que el torneo real." },
              { icon: Share2, title: "Bracket oficial", desc: "Los administradores fijan el resultado oficial; tu puntuación se calcula contra ese cuadro." },
              { icon: Users, title: "Acceso interno", desc: "Registro con email y contraseña para el equipo Technip." },
              { icon: Zap, title: "Guardado seguro", desc: "Tus picks se guardan en Supabase y se reflejan en el ranking." },
              { icon: Globe, title: "Sin grupos ni temas", desc: "Interfaz fija y flujo simple: cuadro + ranking." },
              { icon: Star, title: "Ranking global", desc: "Una sola clasificación con los puntos del cuadro." },
            ].map((feat) => (
              <div
                key={feat.title}
                className="group rounded-xl border border-white/5 bg-surface-container p-6 hover:border-white/10 transition-all"
              >
                <feat.icon className="h-5 w-5 text-secondary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-headline-sm text-on-background">{feat.title}</h3>
                <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── VIRALIDAD / COMPARTE ─── */}
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image / Mockup */}
            <div className="order-2 lg:order-1 relative rounded-2xl border border-white/5 bg-surface-container overflow-hidden p-8 aspect-[4/3] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-tertiary/20 via-transparent to-secondary/20 opacity-30" />
              <div className="relative z-10 w-full max-w-sm rounded-xl border border-white/10 bg-background p-6 shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-secondary" />
                    <span className="font-headline-sm text-sm">Mi Porra - Grupo VIP</span>
                  </div>
                  <Share2 className="h-4 w-4 text-on-surface-variant" />
                </div>
                <div className="space-y-3">
                  <div className="h-12 rounded bg-surface-container-high border border-white/5 flex items-center px-4">
                    <span className="font-display font-bold text-lg text-secondary">1º</span>
                    <span className="ml-3 font-medium flex-1">Denys</span>
                    <span className="text-secondary font-data-mono">145 pts</span>
                  </div>
                  <div className="h-12 rounded bg-surface-container border border-white/5 flex items-center px-4 opacity-70">
                    <span className="font-display font-bold text-lg text-on-surface-variant">2º</span>
                    <span className="ml-3 font-medium flex-1">Alex</span>
                    <span className="text-on-surface-variant font-data-mono">132 pts</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="rounded-full bg-tertiary/10 text-tertiary px-4 py-1.5 text-xs font-semibold flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" /> +12 amigos invitados
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <span className="text-label-caps text-tertiary tracking-widest">MULTIPLICA LA DIVERSIÓN</span>
              <h2 className="mt-3 font-headline-lg text-[clamp(1.75rem,4vw,2.5rem)] text-on-background">
                El fútbol se vive mejor con amigos
              </h2>
              <p className="mt-4 text-body-lg text-on-surface-variant leading-relaxed">
                Invita a tus grupos de WhatsApp, Telegram o Discord con un solo clic.
                Sube de nivel, pica a tus amigos y demuestra quién sabe más de fútbol.
                Haz tu porra viral compartiendo tu ranking en redes sociales.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Enlaces de invitación en 1 clic",
                  "Comparte tu cuadro en Instagram Stories",
                  "Ligas privadas ilimitadas",
                  "Notificaciones de goles y cambios en el ranking"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-on-surface">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-20 md:py-28">
          <div className="relative rounded-3xl border border-secondary/20 bg-gradient-to-br from-secondary/5 via-surface-container to-tertiary/5 overflow-hidden p-12 md:p-16 text-center">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-secondary/10 blur-[120px]" />

            <div className="relative z-10">
              <Trophy className="mx-auto h-12 w-12 text-secondary mb-6" />
              <h2 className="font-display-lg text-[clamp(2rem,5vw,3.5rem)] leading-tight text-on-background">
                ¿Listo para la gloria?
              </h2>
              <p className="mt-4 text-body-lg text-on-surface-variant max-w-lg mx-auto">
                El Mundial 2026 empieza en junio. Crea tu porra hoy, invita a tus
                amigos y demuestra que sabes más de fútbol que nadie.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href={user ? "/app" : "/register"}
                  className="group rounded-xl bg-secondary px-10 py-4 font-headline-sm text-headline-sm text-on-secondary shadow-[0_0_30px_rgba(255,185,85,0.3)] hover:shadow-[0_0_50px_rgba(255,185,85,0.5)] hover:brightness-105 transition-all duration-300 flex items-center gap-2"
                >
                  Crear mi porra gratis
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="mt-4 text-xs text-on-surface-variant">
                Sin tarjeta de crédito · Menos de 1 minuto
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-container-margin text-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-secondary" />
            <p>© {new Date().getFullYear()} Mundial 2026 Porra</p>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="#" className="hover:text-secondary transition-colors">
              Términos
            </Link>
            <Link href="#" className="hover:text-secondary transition-colors">
              Privacidad
            </Link>
            <Link href="#" className="hover:text-secondary transition-colors">
              Contacto
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
