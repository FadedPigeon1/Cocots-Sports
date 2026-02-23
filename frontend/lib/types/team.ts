// Team-related type definitions shared across components

export interface TeamData {
  team_id: number;
  name: string;
  season: string;
  wins: number;
  losses: number;
  win_pct: number;
  ppg: number;
  opp_ppg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  plus_minus: number;
  game_data: {
    game_num: number;
    wins: number;
    losses: number;
    pts: number;
    date: string;
  }[];
}

export interface TeamSeasonData {
  season: string;
  wins: number;
  losses: number;
  win_pct: number;
  ppg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  game_data: { game_num: number; wins: number; pts: number }[];
}

export interface ComparisonData {
  stat: string;
  [key: string]: string | number;
}

export interface TeamDetails {
  team_id: string;
  team_name: string;
  wins: number;
  losses: number;
  win_pct: number;
  conf_rank: number;
  ppg: number;
  opp_ppg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  reb: number;
  ast: number;
  plus_minus: number;
  last_10: string;
  streak: string;
  home_record: string;
  away_record: string;
}

export interface GameLog {
  date: string;
  opponent: string;
  location?: string;
  matchup?: string;
  result: string;
  pts: number;
  opp_pts: number;
  fg_pct: number;
  fg3_pct?: number;
  reb?: number;
  ast?: number;
}
