"use client";

import { Trophy, MapPin } from "lucide-react";

interface GameLog {
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

interface TeamGameLogProps {
  gameLogs: GameLog[];
}

export default function TeamGameLog({ gameLogs }: TeamGameLogProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border bg-muted/40 flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Recent Game Log
        </h3>
        <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
          LAS {gameLogs.length} GAMES
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Opponent</th>
              <th className="px-6 py-4 font-semibold">Result</th>
              <th className="px-6 py-4 font-semibold">Score</th>
              <th className="px-6 py-4 font-semibold">FG%</th>
              <th className="px-6 py-4 font-semibold rounded-tr-xl">+/-</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {gameLogs.map((game, idx) => (
              <tr
                key={idx}
                className="hover:bg-muted/30 transition-colors group"
              >
                <td className="px-6 py-4 font-medium text-foreground">
                  {game.date}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2">
                    {game.location === "@" ? (
                      <MapPin className="h-3 w-3 text-rose-400" />
                    ) : (
                      <MapPin className="h-3 w-3 text-emerald-400" />
                    )}
                    <span className="font-medium">{game.opponent}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${
                      game.result === "W"
                        ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
                        : "bg-rose-500/10 text-rose-500 ring-rose-500/20"
                    }`}
                  >
                    {game.result}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground font-mono">
                  {game.pts} - {game.opp_pts}
                </td>
                <td className="px-6 py-4 text-muted-foreground group-hover:text-foreground transition-colors">
                  {(game.fg_pct * 100).toFixed(1)}%
                </td>
                <td
                  className={`px-6 py-4 font-medium ${
                    game.pts - game.opp_pts > 0
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {game.pts - game.opp_pts > 0 ? "+" : ""}
                  {game.pts - game.opp_pts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
