"use client";

import { Target, Trophy } from "lucide-react";

interface PlayerStats {
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  games_played: number;
}

interface RecentGame {
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
}

interface PlayerSidebarProps {
  stats: PlayerStats;
  recentGames: RecentGame[];
}

export default function PlayerSidebar({
  stats,
  recentGames,
}: PlayerSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Shooting Efficiency
        </h3>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Field Goal</span>
              <span className="font-bold">
                {(stats.fg_pct * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${stats.fg_pct * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">3-Point</span>
              <span className="font-bold">
                {(stats.fg3_pct * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${stats.fg3_pct * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Free Throw</span>
              <span className="font-bold">
                {(stats.ft_pct * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${stats.ft_pct * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Season Highs
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/30 p-3 rounded-lg">
            <div className="text-2xl font-bold">
              {Math.max(...recentGames.map((g) => g.pts))}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              Points
            </div>
          </div>
          <div className="bg-secondary/30 p-3 rounded-lg">
            <div className="text-2xl font-bold">
              {Math.max(...recentGames.map((g) => g.reb))}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              Rebounds
            </div>
          </div>
          <div className="bg-secondary/30 p-3 rounded-lg">
            <div className="text-2xl font-bold">
              {Math.max(...recentGames.map((g) => g.ast))}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              Assists
            </div>
          </div>
          <div className="bg-secondary/30 p-3 rounded-lg">
            <div className="text-2xl font-bold">
              {Math.max(...recentGames.map((g) => g.blk))}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              Blocks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
