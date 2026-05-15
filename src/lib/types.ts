export type UserRole = "participant" | "admin";
export type BracketRound = "r32" | "r16" | "qf" | "sf" | "final" | "champion";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface BracketPrediction {
  id: string;
  user_id: string;
  round: BracketRound;
  position: number;
  team: string;
  created_at: string;
}

export interface BracketResult {
  id: string;
  round: Exclude<BracketRound, "champion">;
  position: number;
  team: string;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  bracket_points: number;
}
