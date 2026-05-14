import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TopAppBar } from "@/components/top-app-bar";
import { BottomNav } from "@/components/bottom-nav";
import { CheckTheme } from "@/components/check-theme";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  let rank: number | null = null;
  let points: number | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: me } = await supabase
      .from("leaderboard_view")
      .select("total_points")
      .eq("user_id", user.id)
      .maybeSingle();

    if (me) {
      points = me.total_points;
      const { count } = await supabase
        .from("leaderboard_view")
        .select("*", { count: "exact", head: true })
        .gt("total_points", me.total_points);
      rank = (count ?? 0) + 1;
    }
  } catch {
    // ignore
  }

  return (
    <div
      className="min-h-screen text-on-background"
      style={{
        background: "#0d1117",
        backgroundImage: [
          "radial-gradient(ellipse 90% 55% at 10% 5%, rgba(255,185,85,0.10) 0%, transparent 55%)",
          "radial-gradient(ellipse 70% 45% at 90% 90%, rgba(89,222,155,0.07) 0%, transparent 50%)",
          "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(13,27,42,0.8) 0%, transparent 80%)",
        ].join(", "),
        backgroundAttachment: "fixed",
      }}
    >
      <CheckTheme />
      <TopAppBar
        user={{
          id: user.id,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          role: user.role ?? "participant",
          rank,
          points,
        }}
      />
      <main className="pt-16 pb-24 md:pb-12">{children}</main>
      <BottomNav />
    </div>
  );
}
