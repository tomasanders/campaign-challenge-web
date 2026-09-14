export interface CreateScorePayload {
  score: number;
  duration_ms: number;
}

export interface Score {
  id: number;
  participant_id: number;
  score: number;
  duration_ms: number;
  played_at: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreResponse {
  score: Score;
}
