"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { Menu } from "lucide-react";
import { SideDrawer } from "./side-drawer";

interface TopAppBarProps {
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    rank?: number | null;
    points?: number | null;
  };
}

/**
 * Persistent top bar shown across the authenticated app. Hosts the menu
 * trigger that opens the side drawer (overlay on mobile, persistent on
 * desktop) and the user avatar that links to the profile page.
 */
export function TopAppBar({ user }: TopAppBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggle = useCallback(() => setDrawerOpen((s) => !s), []);
  const close = useCallback(() => setDrawerOpen(false), []);

  const initials = (user.full_name ?? "?").charAt(0).toUpperCase();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-container-margin bg-background/85 backdrop-blur-xl border-b border-white/10">
        <button
          type="button"
          onClick={toggle}
          aria-label="Alternar menú"
          className="text-secondary hover:opacity-80 active:scale-95 -ml-2 p-2 rounded-full transition"
        >
          <Menu size={24} strokeWidth={1.75} />
        </button>

        <Link
          href="/app"
          className="absolute left-1/2 -translate-x-1/2 font-headline text-headline-md md:text-headline-lg font-bold tracking-tight text-secondary"
        >
          Technip 2026
        </Link>

        <Link
          href="/app/perfil"
          aria-label="Mi perfil"
          className="h-9 w-9 rounded-full overflow-hidden border border-white/10 bg-surface-container flex items-center justify-center text-secondary text-sm font-bold hover:opacity-80 active:scale-95 transition"
        >
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name ?? ""}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span>{initials}</span>
          )}
        </Link>
      </header>

      <SideDrawer user={user} open={drawerOpen} onClose={close} />
    </>
  );
}
