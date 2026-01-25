-- Supabase SQL Schema for Tracked Teams and Players
-- Run this in the Supabase SQL Editor

-- Create tracked_teams table
CREATE TABLE IF NOT EXISTS tracked_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL,
  team_name TEXT NOT NULL,
  team_abbreviation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't track the same team twice
  UNIQUE(user_id, team_id)
);

-- Create tracked_players table
CREATE TABLE IF NOT EXISTS tracked_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  team_abbreviation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't track the same player twice
  UNIQUE(user_id, player_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tracked_teams_user_id ON tracked_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_players_user_id ON tracked_players(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE tracked_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_players ENABLE ROW LEVEL SECURITY;

-- Create policies for tracked_teams
-- Users can only see their own tracked teams
CREATE POLICY "Users can view their own tracked teams"
  ON tracked_teams FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tracked teams
CREATE POLICY "Users can insert their own tracked teams"
  ON tracked_teams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tracked teams
CREATE POLICY "Users can delete their own tracked teams"
  ON tracked_teams FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for tracked_players
-- Users can only see their own tracked players
CREATE POLICY "Users can view their own tracked players"
  ON tracked_players FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tracked players
CREATE POLICY "Users can insert their own tracked players"
  ON tracked_players FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tracked players
CREATE POLICY "Users can delete their own tracked players"
  ON tracked_players FOR DELETE
  USING (auth.uid() = user_id);
