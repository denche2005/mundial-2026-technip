"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Network, Trophy, User } from "lucide-react";
import { clsx } from "clsx";

const TABS = [
  { href: "/app/simulador", label: "Cuadro", icon: Network },
  { href: "/app/ranking", label: "Ranking", icon: Trophy },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface-container/95 backdrop-blur-md px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
      <ul className="flex justify-around items-stretch gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex flex-col items-center justify-center gap-0.5 rounded-md py-1.5 transition-colors",
                  active
                    ? "bg-secondary text-on-secondary"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                <Icon size={22} strokeWidth={active ? 2 : 1.75} />
                <span
                  className={clsx(
                    "text-[10px] font-semibold tracking-wide",
                    active ? "" : "opacity-80"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
