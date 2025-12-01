-- NBA Prediction App - Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (Extended from Supabase Auth)
-- ============================================
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    favorite_team_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NBA TEAMS
-- ============================================
CREATE TABLE public.teams (
    id SERIAL PRIMARY KEY,
    api_team_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    conference VARCHAR(20) NOT NULL,
    division VARCHAR(50) NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NBA PLAYERS
-- ============================================
CREATE TABLE public.players (
    id SERIAL PRIMARY KEY,
    api_player_id INTEGER UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    position VARCHAR(20),
    jersey_number INTEGER,
    height_cm INTEGER,
    weight_kg INTEGER,
    birth_date DATE,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- GAMES
-- ============================================
CREATE TABLE public.games (
    id SERIAL PRIMARY KEY,
    api_game_id INTEGER UNIQUE NOT NULL,
    game_date TIMESTAMP WITH TIME ZONE NOT NULL,
    home_team_id INTEGER REFERENCES teams(id) NOT NULL,
    away_team_id INTEGER REFERENCES teams(id) NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(20) NOT NULL, -- scheduled, live, completed, postponed
    season VARCHAR(10) NOT NULL,
    venue VARCHAR(255),
    attendance INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- ============================================
-- PREDICTIONS
-- ============================================
CREATE TABLE public.predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE NOT NULL,
    home_team_id INTEGER REFERENCES teams(id) NOT NULL,
    away_team_id INTEGER REFERENCES teams(id) NOT NULL,
    game_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Prediction results
    predicted_winner VARCHAR(10) NOT NULL, -- 'home' or 'away'
    home_win_probability DECIMAL(5, 4) NOT NULL,
    away_win_probability DECIMAL(5, 4) NOT NULL,
    confidence DECIMAL(5, 4) NOT NULL,
    
    -- Model metadata
    model_version VARCHAR(50) NOT NULL,
    features JSONB, -- Store input features for analysis
    
    -- Outcome tracking
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed
    is_correct BOOLEAN,
    actual_winner VARCHAR(10),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_probabilities CHECK (
        home_win_probability + away_win_probability = 1.0
    )
);

-- ============================================
-- TEAM STATISTICS
-- ============================================
CREATE TABLE public.team_stats (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    season VARCHAR(10) NOT NULL,
    games_played INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    
    -- Scoring
    points_per_game DECIMAL(5, 2),
    points_allowed_per_game DECIMAL(5, 2),
    field_goal_percentage DECIMAL(5, 4),
    three_point_percentage DECIMAL(5, 4),
    free_throw_percentage DECIMAL(5, 4),
    
    -- Advanced metrics
    offensive_rating DECIMAL(6, 2),
    defensive_rating DECIMAL(6, 2),
    net_rating DECIMAL(6, 2),
    pace DECIMAL(5, 2),
    
    -- Rebounds
    rebounds_per_game DECIMAL(5, 2),
    offensive_rebounds_per_game DECIMAL(5, 2),
    defensive_rebounds_per_game DECIMAL(5, 2),
    
    -- Other stats
    assists_per_game DECIMAL(5, 2),
    steals_per_game DECIMAL(5, 2),
    blocks_per_game DECIMAL(5, 2),
    turnovers_per_game DECIMAL(5, 2),
    
    -- Home/Away splits
    home_wins INTEGER DEFAULT 0,
    home_losses INTEGER DEFAULT 0,
    away_wins INTEGER DEFAULT 0,
    away_losses INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, season)
);

-- ============================================
-- PLAYER STATISTICS
-- ============================================
CREATE TABLE public.player_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    season VARCHAR(10) NOT NULL,
    team_id INTEGER REFERENCES teams(id) NOT NULL,
    games_played INTEGER NOT NULL DEFAULT 0,
    games_started INTEGER DEFAULT 0,
    minutes_per_game DECIMAL(5, 2),
    
    -- Scoring
    points_per_game DECIMAL(5, 2),
    field_goals_made DECIMAL(5, 2),
    field_goals_attempted DECIMAL(5, 2),
    field_goal_percentage DECIMAL(5, 4),
    three_pointers_made DECIMAL(5, 2),
    three_pointers_attempted DECIMAL(5, 2),
    three_point_percentage DECIMAL(5, 4),
    free_throws_made DECIMAL(5, 2),
    free_throws_attempted DECIMAL(5, 2),
    free_throw_percentage DECIMAL(5, 4),
    
    -- Other stats
    rebounds_per_game DECIMAL(5, 2),
    assists_per_game DECIMAL(5, 2),
    steals_per_game DECIMAL(5, 2),
    blocks_per_game DECIMAL(5, 2),
    turnovers_per_game DECIMAL(5, 2),
    fouls_per_game DECIMAL(5, 2),
    
    -- Advanced
    player_efficiency_rating DECIMAL(6, 2),
    true_shooting_percentage DECIMAL(5, 4),
    usage_rate DECIMAL(5, 4),
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(player_id, team_id, season)
);

-- ============================================
-- INJURIES
-- ============================================
CREATE TABLE public.injuries (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    injury_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL, -- out, day-to-day, questionable, probable
    injury_date DATE NOT NULL,
    expected_return_date DATE,
    actual_return_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MODEL VERSIONS (ML Model Tracking)
-- ============================================
CREATE TABLE public.model_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) UNIQUE NOT NULL,
    accuracy DECIMAL(5, 4) NOT NULL,
    roc_auc DECIMAL(5, 4) NOT NULL,
    precision_score DECIMAL(5, 4),
    recall_score DECIMAL(5, 4),
    f1_score DECIMAL(5, 4),
    
    -- Training metadata
    training_samples INTEGER,
    test_samples INTEGER,
    features_used JSONB,
    hyperparameters JSONB,
    
    -- Deployment
    status VARCHAR(20) DEFAULT 'inactive', -- active, inactive, archived
    deployed_at TIMESTAMP WITH TIME ZONE,
    deprecated_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER FAVORITES
-- ============================================
CREATE TABLE public.user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT favorite_type CHECK (
        (team_id IS NOT NULL AND player_id IS NULL) OR
        (team_id IS NULL AND player_id IS NOT NULL)
    ),
    UNIQUE(user_id, team_id),
    UNIQUE(user_id, player_id)
);

-- ============================================
-- USER SETTINGS
-- ============================================
CREATE TABLE public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    notification_enabled BOOLEAN DEFAULT true,
    email_predictions BOOLEAN DEFAULT false,
    theme VARCHAR(20) DEFAULT 'light',
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferred_odds_format VARCHAR(20) DEFAULT 'decimal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Predictions
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_game_id ON predictions(game_id);
CREATE INDEX idx_predictions_status ON predictions(status);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);

-- Games
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_games_home_team ON games(home_team_id);
CREATE INDEX idx_games_away_team ON games(away_team_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_season ON games(season);

-- Players
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_active ON players(is_active);

-- Stats
CREATE INDEX idx_team_stats_season ON team_stats(season);
CREATE INDEX idx_player_stats_season ON player_stats(season);
CREATE INDEX idx_injuries_player ON injuries(player_id);
CREATE INDEX idx_injuries_status ON injuries(status);

-- Favorites
CREATE INDEX idx_favorites_user ON user_favorites(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Predictions Policies
CREATE POLICY "Users can view their own predictions"
    ON predictions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own predictions"
    ON predictions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions"
    ON predictions FOR UPDATE
    USING (auth.uid() = user_id);

-- Favorites Policies
CREATE POLICY "Users can view their own favorites"
    ON user_favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites"
    ON user_favorites FOR ALL
    USING (auth.uid() = user_id);

-- Settings Policies
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR ALL
    USING (auth.uid() = user_id);

-- Public read access for reference data
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

CREATE POLICY "Players are viewable by everyone"
    ON players FOR SELECT
    USING (true);

CREATE POLICY "Games are viewable by everyone"
    ON games FOR SELECT
    USING (true);

CREATE POLICY "Team stats are viewable by everyone"
    ON team_stats FOR SELECT
    USING (true);

CREATE POLICY "Player stats are viewable by everyone"
    ON player_stats FOR SELECT
    USING (true);

CREATE POLICY "Injuries are viewable by everyone"
    ON injuries FOR SELECT
    USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update prediction outcome
CREATE OR REPLACE FUNCTION public.update_prediction_outcome()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
        UPDATE predictions
        SET 
            status = 'completed',
            actual_winner = CASE 
                WHEN NEW.home_score > NEW.away_score THEN 'home'
                ELSE 'away'
            END,
            is_correct = CASE
                WHEN NEW.home_score > NEW.away_score THEN predicted_winner = 'home'
                ELSE predicted_winner = 'away'
            END
        WHERE game_id = NEW.id AND status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on games completion
CREATE TRIGGER on_game_completed
    AFTER UPDATE ON games
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION public.update_prediction_outcome();
