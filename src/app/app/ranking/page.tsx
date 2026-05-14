import { clsx } from "clsx";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import type { LeaderboardEntry } from "@/lib/types";

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

  const percentile =
    rows.length > 0 && myRankIndex >= 0
      ? Math.max(1, Math.round(((myRankIndex + 1) / rows.length) * 100))
      : 100;

  return (
    <div className="relative min-h-screen bg-[#f8f9fa]">
      <div className="relative mx-auto max-w-lg px-container-margin pt-20 pb-32">
        <header className="mb-6 text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#004c84]">
            Clasificación
          </h1>
          <p className="text-xs text-[#878787]">
            Puntuación por cuadro eliminatorio
          </p>
        </header>

        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#878787] rounded-2xl border border-dashed border-[#dedede] bg-white">
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
                    "px-4 py-3 rounded-2xl transition-all bg-white border shadow-sm",
                    isSelf
                      ? "border-[#0070ef] shadow-[0_0_12px_rgba(0,112,239,0.1)]"
                      : "border-[#dedede] hover:shadow-md"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={clsx(
                        "text-lg font-bold w-7 text-center shrink-0",
                        isSelf || isFirst
                          ? "text-[#0070ef]"
                          : "text-[#878787]"
                      )}
                    >
                      {rank}
                    </span>

                    <div
                      className={clsx(
                        "w-9 h-9 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-[#f0f2f5]",
                        isFirst
                          ? "ring-2 ring-[#0070ef] ring-offset-1 ring-offset-white"
                          : isSelf
                            ? "ring-2 ring-[#0070ef]/50 ring-offset-1 ring-offset-white"
                            : ""
                      )}
                    >
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.full_name ?? "Avatar"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-[#004c84]">
                          {(entry.full_name ?? "A").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center min-w-0 flex-1 gap-2">
                      <span
                        className={clsx(
                          "text-sm font-semibold truncate",
                          isSelf || isFirst
                            ? "text-[#0070ef]"
                            : "text-[#1a1a2e]"
                        )}
                      >
                        {entry.full_name ?? "Anónimo"}
                      </span>
                      {isSelf && (
                        <svg
                          viewBox="0 0 24 24"
                          className="w-3.5 h-3.5 text-[#0070ef] shrink-0"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 shrink-0">
                      <span
                        className={clsx(
                          "text-lg font-bold tabular-nums",
                          isSelf || isFirst
                            ? "text-[#80c7a0]"
                            : "text-[#1a1a2e]"
                        )}
                      >
                        {entry.total_points.toLocaleString("es-ES")}
                      </span>
                      <span className="text-[10px] font-bold text-[#878787] uppercase tracking-wide">
                        pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="w-full max-w-xs mx-auto">
          <div className="rounded-xl px-4 py-3 bg-white border border-[#dedede] shadow-sm">
            <p className="text-[10px] font-bold tracking-[0.08em] text-[#878787] uppercase mb-1.5">
              Tu percentil
            </p>
            <p className="text-xl font-bold text-[#0070ef] leading-none mb-2.5">
              Top {percentile}%
            </p>
            <div
              className="h-1.5 w-full rounded-full overflow-hidden"
              style={{ background: "#dedede" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(8, 100 - percentile)}%`,
                  background: "linear-gradient(90deg, #80c7a0, #0070ef)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
