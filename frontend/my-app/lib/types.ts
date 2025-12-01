export interface Team {
  id: number
  api_team_id: number
  name: string
  abbreviation: string
  city: string
  conference: string
  division: string
  logo_url?: string
}

export interface Player {
  id: number
  api_player_id: number
  first_name: string
  last_name: string
  team_id?: number
  position?: string
  jersey_number?: number
  photo_url?: string
  is_active: boolean
}

export interface Game {
  id: number
  api_game_id: number
  game_date: string
  home_team_id: number
  away_team_id: number
  home_score?: number
  away_score?: number
  status: 'scheduled' | 'live' | 'completed' | 'postponed'
  season: string
  venue?: string
  home_team?: Team
  away_team?: Team
}

export interface Prediction {
  id: string
  user_id: string
  game_id: number
  home_team_id: number
  away_team_id: number
  game_date: string
  predicted_winner: 'home' | 'away'
  home_win_probability: number
  away_win_probability: number
  confidence: number
  model_version: string
  status: 'pending' | 'completed'
  is_correct?: boolean
  actual_winner?: 'home' | 'away'
  created_at: string
  game?: Game
}

export interface PredictionRequest {
  home_team_id: number
  away_team_id: number
  game_date: string
  user_id: string
}

export interface PredictionResponse {
  prediction_id: string
  home_team_id: number
  away_team_id: number
  predicted_winner: string
  home_win_probability: number
  away_win_probability: number
  confidence: number
  model_version: string
  created_at: string
}

export interface UserAccuracy {
  user_id: string
  total_predictions: number
  correct_predictions: number
  accuracy: number
  by_confidence: {
    high: ConfidenceAccuracy
    medium: ConfidenceAccuracy
    low: ConfidenceAccuracy
  }
}

export interface ConfidenceAccuracy {
  total: number
  correct: number
  accuracy: number
}

export interface TeamStats {
  id: number
  team_id: number
  season: string
  games_played: number
  wins: number
  losses: number
  points_per_game: number
  points_allowed_per_game: number
  offensive_rating: number
  defensive_rating: number
  net_rating: number
}

export interface UserProfile {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
  favorite_team_id?: number
  created_at: string
}
