"use server"

import { createClient } from "@/lib/supabase/server"
import { PredictionRequest, PredictionResponse } from "@/lib/types"

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

export async function createPrediction(data: PredictionRequest): Promise<PredictionResponse> {
  const supabase = await createClient()
  
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  // Call FastAPI prediction endpoint
  const response = await fetch(`${FASTAPI_URL}/api/v1/predictions/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      user_id: user.id,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create prediction")
  }

  return response.json()
}

export async function getUserPredictions(userId: string, limit = 50) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("predictions")
    .select(`
      *,
      game:games(
        *,
        home_team:teams!games_home_team_id_fkey(*),
        away_team:teams!games_away_team_id_fkey(*)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getUserAccuracy(userId: string) {
  const response = await fetch(
    `${FASTAPI_URL}/api/v1/predictions/accuracy/${userId}`,
    {
      next: { revalidate: 300 }, // Cache for 5 minutes
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch accuracy")
  }

  return response.json()
}

export async function getUpcomingGames(date?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("games")
    .select(`
      *,
      home_team:teams!games_home_team_id_fkey(*),
      away_team:teams!games_away_team_id_fkey(*)
    `)
    .eq("status", "scheduled")
    .order("game_date", { ascending: true })
    .limit(20)

  if (date) {
    query = query.gte("game_date", date)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getTeamStats(teamId: number, season = "2024-2025") {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("team_stats")
    .select("*")
    .eq("team_id", teamId)
    .eq("season", season)
    .single()

  if (error) throw error
  return data
}

export async function getAllTeams() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name")

  if (error) throw error
  return data
}

export async function getTeam(teamId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single()

  if (error) throw error
  return data
}
