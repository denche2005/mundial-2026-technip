import { clsx } from "clsx";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import type { LeaderboardEntry } from "@/lib/types";
import { RankingPointsBreakdown } from "@/components/ranking-points-breakdown";

const LB_SELECT =
  "user_id, full_name, avatar_url, total_points, match_points, exact_results, tendency_results, bracket_points";

export default async function RankingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("leaderboard_view")
    .select(LB_SELECT)
    .order("total_points", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as LeaderboardEntry[];

  const myRankIndex = rows.findIndex((entry) => entry.user_id === user.id);
  const myEntry = myRankIndex >= 0 ? rows[myRankIndex] : null;

  const percentile =
    rows.length > 0 && myRankIndex >= 0
      ? Math.max(1, Math.round(((myRankIndex + 1) / rows.length) * 100))
      : 100;

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.07]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80)",
          maskImage:
            "radial-gradient(circle at 50% 30%, black 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 30%, black 20%, transparent 80%)",
        }}
      />
      <div className="relative mx-auto max-w-lg px-container-margin pt-20 pb-32">
        <header className="mb-6 text-center space-y-1">
          <h1 className="font-display-lg text-2xl sm:text-3xl font-bold tracking-tight text-secondary drop-shadow-[0_0_24px_rgba(255,185,85,0.2)]">
            Clasificación
          </h1>
          <p className="text-xs text-on-surface-variant">
            Puntuación solo por cuadro (Technip)
          </p>
        </header>

        {rows.length === 0 ? (
          <div
            className="p-10 text-center text-sm text-on-surface-variant rounded-2xl"
            style={{ border: "1px dashed rgba(255,255,255,0.12)" }}
          >
            Aún no hay puntuaciones.
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-8">
            {rows.map((entry) => {
              const rank =
                rows.findIndex((e) => e.user_id === entry.user_id) + 1;
              const isSelf = entry.user_id === user.id;
              const isFirst = rank === 1;

              return (
                <div
                  key={entry.user_id}
                  className={clsx(
                    "flex flex-col gap-0 px-5 py-4 rounded-2xl transition-all",
                    isSelf
                      ? "border-secondary/50 shadow-[0_0_24px_rgba(255,185,85,0.1)]"
                      : "hover:brightness-110"
                  )}
                  style={{
                    background: isSelf
                      ? "rgba(255,185,85,0.07)"
                      : "rgba(27,38,59,0.55)",
                    backdropFilter: "blur(12px)",
                    border: isSelf
                      ? "1px solid rgba(255,185,85,0.35)"
                      : "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={clsx(
                        "font-archivo text-2xl font-bold w-8 text-center shrink-0 leading-none pt-0.5",
                        isSelf || isFirst
                          ? "text-secondary"
                          : "text-on-surface-variant"
                      )}
                    >
                      {rank}
                    </span>

                    <div
                      className={clsx(
                        "w-12 h-12 shrink-0 rounded-full overflow-hidden flex items-center justify-center",
                        isFirst
                          ? "ring-2 ring-secondary ring-offset-2 ring-offset-background"
                          : isSelf
                            ? "ring-2 ring-secondary/50 ring-offset-1 ring-offset-background"
                            : ""
                      )}
                      style={{ background: "rgba(51,53,51,0.8)" }}
                    >
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.full_name ?? "Avatar"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-on-surface">
                          {(entry.full_name ?? "A").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={clsx(
                            "font-archivo text-base font-bold truncate",
                            isSelf || isFirst
                              ? "text-secondary"
                              : "text-on-surface"
                          )}
                        >
                          {entry.full_name ?? "Anónimo"}
                        </span>
                        {isSelf && (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-4 h-4 text-secondary shrink-0"
                            fill="currentColor"
                            aria-hidden
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        )}
                      </div>
                      <RankingPointsBreakdown entry={entry} />
                    </div>

                    <div className="flex flex-col items-end shrink-0 pt-0.5">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={clsx(
                            "font-archivo text-2xl font-bold tabular-nums",
                            isSelf || isFirst
                              ? "text-secondary"
                              : "text-on-surface"
                          )}
                        >
                          {entry.total_points.toLocaleString("es-ES")}
                        </span>
                        <span className="font-hanken text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">
                          pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid w-full grid-cols-2 gap-3">
          <div
            className="rounded-xl px-3 py-2.5 min-w-0"
            style={{
              background: "rgba(27,38,59,0.75)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="font-hanken text-[10px] font-bold tracking-[0.08em] text-on-surface-variant uppercase mb-1.5">
              Percentil
            </p>
            <p className="font-archivo text-xl font-bold text-secondary leading-none mb-2.5">
              Top {percentile}%
            </p>
            <div
              className="h-1 w-full rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(8, 100 - percentile)}%`,
                  background: "linear-gradient(90deg, #59de9b, #ffb955)",
                }}
              />
            </div>
          </div>

          <div
            className="rounded-xl px-2 py-2 min-w-0"
            style={{
              background: "rgba(27,38,59,0.75)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="font-hanken text-[9px] font-bold tracking-[0.06em] text-on-surface-variant uppercase mb-1.5">
              Tu cuadro
            </p>
            {myEntry ? (
              <p className="font-archivo text-xl font-bold tabular-nums text-secondary leading-tight">
                {myEntry.bracket_points.toLocaleString("es-ES")}{" "}
                <span className="text-xs font-hanken text-on-surface-variant">
                  pts
                </span>
              </p>
            ) : (
              <p className="text-[10px] leading-snug text-on-surface-variant">
                Sin datos.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
