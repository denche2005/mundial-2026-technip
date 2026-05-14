"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GitBranch, Trophy, Settings, LogOut, User } from "lucide-react";
import { clsx } from "clsx";
import { logout } from "@/actions/auth";

const navItems = [
  { href: "/app/simulador", label: "Cuadro", icon: GitBranch },
  { href: "/app/ranking", label: "Ranking", icon: Trophy },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

const adminItem = {
  href: "/app/admin/bracket",
  label: "Admin",
  icon: Settings,
};

export function AppNav({ role }: { role: string }) {
  const pathname = usePathname();
  const items = role === "admin" ? [...navItems, adminItem] : navItems;
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await logout();
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          <Link
            href="/app"
            className="mr-2 hidden items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-on-surface sm:flex"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-secondary text-[10px] font-bold text-on-secondary">
              T
            </span>
            Technip 2026
          </Link>
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-secondary text-on-secondary"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface disabled:opacity-60"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </nav>
  );
}
