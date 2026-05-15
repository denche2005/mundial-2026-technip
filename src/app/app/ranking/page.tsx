import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import type { LeaderboardEntry } from "@/lib/types";
import { RankingList } from "@/components/ranking-list";

/** Ranking siempre fresco tras guardar resultados oficiales en admin. */
export const dynamic = "force-dynamic";

const LB_SELECT = "user_id, full_name, avatar_url, total_points, bracket_points";

export default async function RankingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("leaderboard_view")
    .select(LB_SELECT)
    .order("total_points", { ascending: false })
    .limit(500);

  const rows = (data ?? []) as LeaderboardEntry[];

  const myRankIndex = rows.findIndex((entry) => entry.user_id === user.id);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;

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

        <RankingList rows={rows} currentUserId={user.id} myRank={myRank} />

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
