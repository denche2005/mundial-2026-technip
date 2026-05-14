"use client";

import { Badge } from "./badge";
import type { Match } from "@/lib/types";

interface MatchCardHeaderProps {
  match: Match;
  points?: number | null;
}

export function MatchCardHeader({ match, points }: MatchCardHeaderProps) {
  const date = new Date(match.kickoff_at);
  const isLocked = new Date() >= date;

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
          {" · "}
          {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
        </span>
        {match.status === "finished" && (
          <Badge variant="neutral">Finalizado</Badge>
        )}
        {match.status === "live" && (
          <Badge variant="warning">En juego</Badge>
        )}
        {isLocked && match.status === "scheduled" && (
          <Badge variant="error">Bloqueado</Badge>
        )}
      </div>
      {points !== null && points !== undefined && (
        <Badge variant={points === 3 ? "success" : points > 0 ? "primary" : "neutral"}>
          +{points} pts
        </Badge>
      )}
    </div>
  );
}
