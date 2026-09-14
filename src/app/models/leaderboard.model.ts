export interface LeaderboardEntry {
  score: number;
  first_name: string;
  played_at: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}
