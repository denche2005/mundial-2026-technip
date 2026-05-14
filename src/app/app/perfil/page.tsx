import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, ShieldAlert, BookOpen, LogOut } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ProfileIdentity } from "@/components/profile-identity";
import { logout } from "@/actions/auth";

export default async function PerfilPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const authEmail = authData?.user?.email ?? null;

  const service = createServiceClient();
  const { data: profileExtra } = await service
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

  const email =
    authEmail?.trim() ||
    profileExtra?.email?.trim() ||
    "Email no disponible";

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: "linear-gradient(180deg, #0a1016 0%, #0d1622 40%, #0b1219 100%)" }}
    >
      <main className="mx-auto max-w-lg px-container-margin py-porra-lg space-y-porra-lg">
        <div
          className="rounded-xl border border-white/10 p-porra-md shadow-sm"
          style={{
            background: "rgba(27, 38, 59, 0.55)",
            backdropFilter: "blur(12px)",
          }}
        >
          <ProfileIdentity
            initialName={user.full_name ?? "Participante"}
            initialAvatarUrl={user.avatar_url}
          />
          <p className="mt-4 border-t border-white/10 pt-3 text-center text-sm text-on-surface-variant break-all">
            {email}
          </p>
        </div>

        <section className="space-y-porra-sm">
          <h3 className="font-headline-sm text-headline-sm text-on-surface px-0.5 mb-1">
            Enlaces
          </h3>
          <div
            className="overflow-hidden rounded-lg border border-white/10 divide-y divide-white/[0.08]"
            style={{ background: "rgba(30, 32, 30, 0.92)" }}
          >
            <Link
              href="/app/simulador"
              className="flex items-center justify-between gap-3 p-porra-sm transition hover:bg-white/[0.04]"
            >
              <span className="font-body-md text-on-surface">Mi cuadro</span>
              <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant" />
            </Link>
            <Link
              href="/app/ranking"
              className="flex items-center justify-between gap-3 p-porra-sm transition hover:bg-white/[0.04]"
            >
              <span className="font-body-md text-on-surface">Clasificación global</span>
              <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant" />
            </Link>
            <Link
              href="/app/reglas"
              className="flex items-center justify-between gap-3 p-porra-sm transition hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-porra-md">
                <BookOpen className="h-5 w-5 shrink-0 text-on-surface" />
                <span className="font-body-md text-on-surface">Puntuación del cuadro</span>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant" />
            </Link>
          </div>
        </section>

        {user.role === "admin" && (
          <section>
            <Link
              href="/app/admin/bracket"
              className="flex items-center gap-3 rounded-lg border border-error/35 bg-error/10 p-porra-md text-error transition hover:bg-error/15"
            >
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span className="font-headline-sm">Admin — bracket oficial</span>
            </Link>
          </section>
        )}

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg py-porra-sm text-sm font-bold text-error transition hover:bg-error/10"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>

        <p className="text-center text-[10px] text-on-surface-variant">
          Porra Technip — Mundial 2026
        </p>
      </main>
    </div>
  );
}
