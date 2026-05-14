export type MatchStatus = "scheduled" | "live" | "finished";
export type UserRole = "participant" | "admin";
export type Stage = "group" | "r32" | "r16" | "qf" | "sf" | "final";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  theme_city?: string;
  created_at: string;
}

export interface Match {
  id: string;
  kickoff_at: string;
  stage: Stage;
  group_code: string | null;
  team_1: string;
  team_2: string;
  goals_1: number | null;
  goals_2: number | null;
  status: MatchStatus;
  created_by: string;
}

export interface MatchPrediction {
  id: string;
  user_id: string;
  match_id: string;
  pred_goals_1: number;
  pred_goals_2: number;
  points_awarded: number | null;
  created_at: string;
  updated_at: string;
}

export interface BracketPrediction {
  id: string;
  user_id: string;
  /** Incluye `champion` (campeón elegido en el simulador). */
  round: Stage | "champion";
  position: number;
  team: string;
  created_at: string;
}

export interface BracketResult {
  id: string;
  round: Stage;
  position: number;
  team: string;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  /** Suma de puntos en partidos (plenos + signo). Viene de `leaderboard_view`. */
  match_points?: number;
  exact_results: number;
  tendency_results: number;
  bracket_points: number;
}
