"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Scale, Settings, LogOut, X, User, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";
import { logout } from "@/actions/auth";

interface SideDrawerProps {
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    rank?: number | null;
    points?: number | null;
  };
  open: boolean;
  onClose: () => void;
}

const NAV_LINKS: { href: string; label: string; icon: typeof User }[] = [
  { href: "/app/perfil", label: "Mi perfil", icon: User },
  { href: "/app/ranking", label: "Clasificación", icon: ShieldCheck },
];

const SECONDARY_LINKS: { href: string; label: string; icon: typeof Scale }[] = [
  { href: "/app/reglas", label: "Puntuación del cuadro", icon: Scale },
];

export function SideDrawer({ user, open, onClose }: SideDrawerProps) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [open]);

  async function handleLogout() {
    setSigningOut(true);
    await logout();
  }

  const initials = (user.full_name ?? "?").charAt(0).toUpperCase();
  const isAdmin = user.role === "admin";

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={clsx(
          "fixed top-16 left-0 bottom-0 z-50 w-80 max-w-[85vw] flex flex-col gap-2 p-4",
          "bg-surface-container-high/95 backdrop-blur-2xl border-r border-white/10 shadow-2xl",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Cerrar menú"
          className="absolute right-3 top-3 z-50 inline-flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-white/10"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-surface-container border border-white/10 flex items-center justify-center text-secondary font-bold">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name ?? ""}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-headline text-headline-sm">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-secondary font-headline text-headline-sm truncate">
              {user.full_name ?? "Participante"}
            </h2>
            <p className="font-data-mono text-data-mono text-on-surface-variant">
              {user.rank ? `Puesto #${user.rank}` : "Sin clasificar todavía"}
            </p>
            {isAdmin && (
              <p className="mt-1 inline-flex items-center gap-1 rounded bg-tertiary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tertiary">
                Admin
              </p>
            )}
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-md transition-colors",
                  active
                    ? "bg-secondary/15 text-secondary"
                    : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                )}
              >
                <Icon size={20} strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="my-2 h-px bg-white/5" />

          {SECONDARY_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-md text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors"
              >
                <Icon size={20} strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/app/admin/bracket"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-md text-tertiary hover:bg-tertiary/10 transition-colors"
            >
              <Settings size={20} strokeWidth={1.75} />
              <span>Admin — bracket oficial</span>
            </Link>
          )}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-md text-error hover:bg-error/10 transition-colors disabled:opacity-50"
          >
            <LogOut size={20} strokeWidth={1.75} />
            <span>{signingOut ? "Cerrando…" : "Cerrar sesión"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
