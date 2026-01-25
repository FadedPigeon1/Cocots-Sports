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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPredictions(gameCount: number = 3): Promise<any[]> {
    // TODO: Implement backend endpoint for daily predictions
    // For now, return mock data based on game count
    const allGames = [
        {
            date: new Date().toISOString(),
            home_team: "Lakers",
            away_team: "Warriors", 
            predicted_winner: "Lakers",
            win_probability: 0.65
        },
        {
            date: new Date().toISOString(),
            home_team: "Celtics",
            away_team: "Heat",
            predicted_winner: "Celtics",
            win_probability: 0.72
        },
        {
            date: new Date().toISOString(),
            home_team: "Nets",
            away_team: "Knicks",
            predicted_winner: "Knicks",
            win_probability: 0.55
        },
        {
            date: new Date().toISOString(),
            home_team: "Thunder",
            away_team: "Spurs",
            predicted_winner: "Thunder",
            win_probability: 0.78
        },
        {
            date: new Date().toISOString(),
            home_team: "Nuggets",
            away_team: "Suns",
            predicted_winner: "Nuggets",
            win_probability: 0.62
        },
        {
            date: new Date().toISOString(),
            home_team: "Bucks",
            away_team: "76ers",
            predicted_winner: "76ers",
            win_probability: 0.58
        },
        {
            date: new Date().toISOString(),
            home_team: "Clippers",
            away_team: "Rockets",
            predicted_winner: "Rockets",
            win_probability: 0.67
        },
        {
            date: new Date().toISOString(),
            home_team: "Pistons",
            away_team: "Bulls",
            predicted_winner: "Pistons",
            win_probability: 0.74
        },
        {
            date: new Date().toISOString(),
            home_team: "Raptors",
            away_team: "Cavaliers",
            predicted_winner: "Raptors",
            win_probability: 0.51
        }
    ];

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(allGames.slice(0, gameCount));
        }, 500);
    });
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
