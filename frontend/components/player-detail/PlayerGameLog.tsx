"use client";

import { Activity } from "lucide-react";

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

interface PlayerGameLogProps {
  recentGames: RecentGame[];
}

export default function PlayerGameLog({ recentGames }: PlayerGameLogProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border bg-muted/40 flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Game Log
        </h3>
        <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
          LAST 10 GAMES
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Matchup</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3 font-bold text-foreground">PTS</th>
              <th className="px-4 py-3">REB</th>
              <th className="px-4 py-3">AST</th>
              <th className="px-4 py-3">STL</th>
              <th className="px-4 py-3">BLK</th>
              <th className="px-4 py-3">FG%</th>
              <th className="px-4 py-3">MIN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentGames.map((game, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground text-left">
                  {game.date}
                </td>
                <td className="px-4 py-3 text-left">
                  <span className="font-medium text-muted-foreground">
                    {game.matchup}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      game.wl === "W"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {game.wl}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-foreground bg-secondary/10">
                  {game.pts}
                </td>
                <td className="px-4 py-3">{game.reb}</td>
                <td className="px-4 py-3">{game.ast}</td>
                <td className="px-4 py-3">{game.stl}</td>
                <td className="px-4 py-3">{game.blk}</td>
                <td className="px-4 py-3">{(game.fg_pct * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 font-mono text-xs">{game.min}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
