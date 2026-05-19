"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { Menu } from "lucide-react";
import { TechnipLogo } from "@/components/ui/technip-logo";
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

export function TopAppBar({ user }: TopAppBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggle = useCallback(() => setDrawerOpen((s) => !s), []);
  const close = useCallback(() => setDrawerOpen(false), []);

  const initials = (user.full_name ?? "?").charAt(0).toUpperCase();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-container-margin bg-white border-b border-[#dedede] shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label="Alternar menú"
            className="text-[#004c84] hover:text-[#0070ef] active:scale-95 -ml-2 p-2 rounded-full transition-colors"
          >
            <Menu size={24} strokeWidth={1.75} />
          </button>

          <Link href="/app" className="flex items-center">
            <TechnipLogo className="h-8 w-auto" />
          </Link>
        </div>

        <div className="h-9 w-9 rounded-full overflow-hidden border border-[#dedede] bg-[#f0f2f5] flex items-center justify-center text-[#004c84] text-sm font-bold">
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
        </div>
      </header>

      <SideDrawer user={user} open={drawerOpen} onClose={close} />
    </>
  );
}
