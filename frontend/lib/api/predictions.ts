import mlApi from './client'
import { z } from 'zod'

// Type definitions
export const GamePredictionSchema = z.object({
  home_team_id: z.number().min(1).max(30),
  away_team_id: z.number().min(1).max(30),
  game_date: z.string().datetime(),
})

export const PlayerStatsSchema = z.object({
  player_id: z.number().positive(),
  opponent_team_id: z.number().min(1).max(30),
  game_date: z.string().datetime(),
  home_game: z.boolean().default(true),
})

export type GamePredictionRequest = z.infer<typeof GamePredictionSchema>
export type PlayerStatsRequest = z.infer<typeof PlayerStatsSchema>

export interface GamePredictionResponse {
  home_team_id: number
  away_team_id: number
  home_win_probability: number
  away_win_probability: number
  predicted_home_score?: number
  predicted_away_score?: number
  confidence: number
  timestamp: string
}

export interface PlayerStatsResponse {
  player_id: number
  predicted_points: number
  predicted_rebounds: number
  predicted_assists: number
  predicted_steals?: number
  predicted_blocks?: number
  confidence: number
  timestamp: string
}

// API Functions
export async function predictGame(
  request: GamePredictionRequest
): Promise<GamePredictionResponse> {
  const validatedRequest = GamePredictionSchema.parse(request)
  const response = await mlApi.post<GamePredictionResponse>(
    '/predict/game',
    validatedRequest
  )
  return response.data
}

export async function predictPlayerStats(
  request: PlayerStatsRequest
): Promise<PlayerStatsResponse> {
  const validatedRequest = PlayerStatsSchema.parse(request)
  const response = await mlApi.post<PlayerStatsResponse>(
    '/predict/player',
    validatedRequest
  )
  return response.data
}

export async function getTeams() {
  const response = await mlApi.get('/teams')
  return response.data
}

export async function getPlayers(teamId: number) {
  const response = await mlApi.get(`/players/${teamId}`)
  return response.data
}

export async function healthCheck() {
  const response = await mlApi.get('/')
  return response.data
}
