import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TopAppBar } from "@/components/top-app-bar";
import { BottomNav } from "@/components/bottom-nav";

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
    <div className="min-h-screen bg-[#f8f9fa] text-on-background">
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
