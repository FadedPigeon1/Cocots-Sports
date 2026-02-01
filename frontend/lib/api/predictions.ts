import mlApi from './client'
import { z } from 'zod'

// Type definitions
export const GamePredictionSchema = z.object({
  home_team_id: z.number().min(1).max(1610612766), // Support large team IDs
  away_team_id: z.number().min(1).max(1610612766),
  game_date: z.string().datetime().optional(),
  games_back: z.number().optional().default(3),
})

export const PlayerStatsSchema = z.object({
  player_id: z.number().positive(),
  opponent_team_id: z.number().min(1).max(1610612766),
  game_date: z.string().datetime(),
  home_game: z.boolean().default(true),
})

export type GamePredictionRequest = z.infer<typeof GamePredictionSchema>
export type PlayerStatsRequest = z.infer<typeof PlayerStatsSchema>

export interface GamePredictionResponse {
  home_team_id: number
  away_team_id: number
  home_team_name?: string
  away_team_name?: string
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getPredictions(gameCount: number = 3): Promise<any[]> {
    try {
        const response = await mlApi.get<GamePredictionResponse[]>('/predict/daily')
        const predictions = response.data.map(p => ({
            date: p.timestamp,
            home_team: p.home_team_name || "Unknown",
            home_team_id: p.home_team_id,
            away_team: p.away_team_name || "Unknown",
            away_team_id: p.away_team_id,
            predicted_winner: p.home_win_probability > p.away_win_probability 
                ? (p.home_team_name || "Home") 
                : (p.away_team_name || "Away"),
            win_probability: Math.max(p.home_win_probability, p.away_win_probability)
        }));
        
        return predictions.slice(0, gameCount); // Respect gameCount for now
    } catch (error) {
        console.error("Error fetching predictions from API, falling back to mock data", error);
        // Fallback to mock data if API fails (e.g. locally if API is not running)
        return getMockPredictions(gameCount);
    }
}

function getMockPredictions(gameCount: number) {
    const allGames = [
        {
            date: new Date().toISOString(),
            home_team: "Lakers",
            home_team_id: 1610612747,
            away_team: "Warriors", 
            away_team_id: 1610612744,
            predicted_winner: "Lakers",
            win_probability: 0.65
        },
        {
            date: new Date().toISOString(),
            home_team: "Celtics",
            home_team_id: 1610612738,
            away_team: "Heat",
            away_team_id: 1610612748,
            predicted_winner: "Celtics",
            win_probability: 0.72
        },
        {
            date: new Date().toISOString(),
            home_team: "Nets",
            home_team_id: 1610612751,
            away_team: "Knicks",
            away_team_id: 1610612752,
            predicted_winner: "Knicks",
            win_probability: 0.55
        },
        {
            date: new Date().toISOString(),
            home_team: "Thunder",
            home_team_id: 1610612760,
            away_team: "Spurs",
            away_team_id: 1610612759,
            predicted_winner: "Thunder",
            win_probability: 0.78
        },
        {
            date: new Date().toISOString(),
            home_team: "Nuggets",
            home_team_id: 1610612743,
            away_team: "Suns",
            away_team_id: 1610612756,
            predicted_winner: "Nuggets",
            win_probability: 0.62
        },
        {
            date: new Date().toISOString(),
            home_team: "Bucks",
            home_team_id: 1610612749,
            away_team: "76ers",
            away_team_id: 1610612755,
            predicted_winner: "76ers",
            win_probability: 0.58
        },
        {
            date: new Date().toISOString(),
            home_team: "Clippers",
            home_team_id: 1610612746,
            away_team: "Rockets",
            away_team_id: 1610612745,
            predicted_winner: "Rockets",
            win_probability: 0.67
        },
        {
            date: new Date().toISOString(),
            home_team: "Pistons",
            home_team_id: 1610612765,
            away_team: "Bulls",
            away_team_id: 1610612741,
            predicted_winner: "Pistons",
            win_probability: 0.74
        },
        {
            date: new Date().toISOString(),
            home_team: "Raptors",
            home_team_id: 1610612761,
            away_team: "Cavaliers",
            away_team_id: 1610612739,
            predicted_winner: "Raptors",
            win_probability: 0.51
        }
    ];

    return new Promise<any[]>((resolve) => {
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
  try {
    const response = await mlApi.get('/predict/teams')
    return response.data
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return [];
  }
}

export async function getPlayers(teamId: number) {
  const response = await mlApi.get(`/players/${teamId}`)
  return response.data
}

export async function healthCheck() {
  const response = await mlApi.get('/')
  return response.data
}
