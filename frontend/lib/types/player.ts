// Player-related type definitions shared across components

export interface PlayerData {
  player_id: number;
  name: string;
  team: string;
  team_id: number;
  position: string;
  season: string;
  games_played: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  mpg: number;
  tov: number;
  game_data: {
    game_num: number;
    pts: number;
    reb: number;
    ast: number;
    date: string;
  }[];
}

export interface PlayerSeasonData {
  season: string;
  games_played: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  mpg: number;
  game_data: { game_num: number; pts: number; reb: number; ast: number }[];
}

export interface ComparisonData {
  stat: string;
  [key: string]: string | number;
}

export interface PlayerDetails {
  info: {
    id: number;
    name: string;
    team: string;
    team_id: number;
    position: string;
    height: string;
    weight: string;
    jersey: string;
    country: string;
    draft_year: string;
    experience: number;
  };
  stats: {
    ppg: number;
    rpg: number;
    apg: number;
    spg: number;
    bpg: number;
    fg_pct: number;
    fg3_pct: number;
    ft_pct: number;
    games_played: number;
  };
  recent_games: {
    game_id: string;
    date: string;
    matchup: string;
    wl: string;
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    fg_pct: number;
    fg3_pct: number;
    ft_pct: number;
    min: string;
  }[];
}

export interface Prediction {
  date: string;
  home_team: string;
  home_team_id: number;
  away_team: string;
  away_team_id: number;
  predicted_winner: string;
  win_probability: number;
}

export interface Team {
  id: number;
  full_name: string;
  abbreviation: string;
}

export type GameCount = 3 | 6 | 9;
