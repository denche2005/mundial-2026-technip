"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { LocateFixed, ChevronRight } from "lucide-react";
import { TechnipLogoMark } from "@/components/ui/technip-logo-mark";
import type { LeaderboardEntry } from "@/lib/types";

interface RankingListProps {
  rows: LeaderboardEntry[];
  currentUserId: string;
  myRank: number | null;
}

export function RankingList({ rows, currentUserId, myRank }: RankingListProps) {
  const selfRef = useRef<HTMLDivElement | null>(null);

  const scrollToMe = useCallback(() => {
    selfRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  if (rows.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-[#878787] rounded-2xl border border-dashed border-[#dedede] bg-white">
        Aún no hay puntuaciones.
      </div>
    );
  }

  return (
    <>
      {myRank != null && (
        <div className="sticky top-[4.25rem] z-20 -mx-1 mb-4 px-1 py-1 bg-[#f8f9fa]/95 backdrop-blur-sm">
          <button
            type="button"
            onClick={scrollToMe}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#0070ef]/30 bg-[#e0efff] px-4 py-2.5 text-sm font-semibold text-[#004c84] shadow-sm hover:bg-[#cce4ff] active:scale-[0.99] transition-all"
          >
            <LocateFixed className="h-4 w-4 shrink-0 text-[#0070ef]" />
            Ir a mi posición
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 mb-8">
        {rows.map((entry, index) => {
          const rank = index + 1;
          const isSelf = entry.user_id === currentUserId;
          const isFirst = rank === 1;

          return (
            <Link
              key={entry.user_id}
              href={`/app/usuario/${entry.user_id}`}
              className={clsx(
                "block px-4 py-3 rounded-2xl transition-all bg-white border shadow-sm scroll-mt-24",
                isSelf
                  ? "border-[#0070ef] shadow-[0_0_12px_rgba(0,112,239,0.1)]"
                  : "border-[#dedede] hover:shadow-md hover:border-[#0070ef]/40"
              )}
            >
              <div ref={isSelf ? selfRef : undefined}>
                <RankingRowContent
                  entry={entry}
                  rank={rank}
                  isSelf={isSelf}
                  isFirst={isFirst}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function RankingRowContent({
  entry,
  rank,
  isSelf,
  isFirst,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isSelf: boolean;
  isFirst: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={clsx(
          "text-lg font-bold w-7 text-center shrink-0",
          isSelf || isFirst ? "text-[#0070ef]" : "text-[#878787]"
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
        <RankingAvatar url={entry.avatar_url} name={entry.full_name} />
      </div>

      <div className="flex items-center min-w-0 flex-1 gap-2">
        <span
          className={clsx(
            "text-sm font-semibold truncate",
            isSelf || isFirst ? "text-[#0070ef]" : "text-[#1a1a2e]"
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
        <span className="text-lg font-bold tabular-nums text-[#004c84]">
          {entry.total_points.toLocaleString("es-ES")}
        </span>
        <span className="text-[10px] font-bold text-[#878787] uppercase tracking-wide">
          pts
        </span>
        <ChevronRight className="h-4 w-4 text-[#878787] shrink-0 ml-0.5" aria-hidden />
      </div>
    </div>
  );
}

function RankingAvatar({
  url,
  name,
}: {
  url: string | null;
  name: string | null;
}) {
  const [broken, setBroken] = useState(false);

  if (!url || broken) {
    return <TechnipLogoMark size="sm" className="h-full w-full" />;
  }

  return (
    <img
      src={url}
      alt={name ?? "Avatar"}
      className="h-full w-full object-cover"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  );
}


