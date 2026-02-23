"use client";

import Image from "next/image";
import { Calendar, ArrowRight, Zap } from "lucide-react";

interface Prediction {
  date: string;
  home_team: string;
  home_team_id: number;
  away_team: string;
  away_team_id: number;
  predicted_winner: string;
  win_probability: number;
}

type GameCount = 3 | 6 | 9;

const getTeamLogo = (teamId: number) =>
  `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`;

interface PredictionsListProps {
  predictions: Prediction[];
  loading: boolean;
  gameCount: GameCount;
  onGameCountChange: (count: GameCount) => void;
}

export default function PredictionsList({
  predictions,
  loading,
  gameCount,
  onGameCountChange,
}: PredictionsListProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Games
        </h3>

        {/* Game Count Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2 flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Predict:
          </span>
          {([3, 6, 9] as GameCount[]).map((count) => (
            <button
              key={count}
              onClick={() => onGameCountChange(count)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                gameCount === count
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {count} Games
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading predictions...
          </div>
        ) : predictions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No predictions available for today&apos;s games.</p>
            <p className="text-sm mt-2">Check back later for updates.</p>
          </div>
        ) : (
          predictions.map((game, idx) => (
            <div
              key={idx}
              className="p-4 hover:bg-secondary/30 transition-colors flex flex-col md:flex-row items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-8 flex-1 justify-center md:justify-start w-full">
                <div className="text-right flex-1 flex items-center justify-end gap-3">
                  <span className="font-bold text-foreground text-lg hidden md:block">
                    {game.home_team}
                  </span>
                  <span className="font-bold text-foreground text-lg md:hidden">
                    {game.home_team.substring(0, 3).toUpperCase()}
                  </span>
                  <div className="w-12 h-12 relative bg-white rounded-full p-1 shrink-0 overflow-hidden border border-border/50 shadow-sm">
                    <Image
                      src={getTeamLogo(game.home_team_id)}
                      alt={game.home_team}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="px-3 py-1 bg-secondary rounded-full text-xs font-mono text-muted-foreground font-bold shadow-inner">
                    VS
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                    7:30 PM
                  </span>
                </div>

                <div className="text-left flex-1 flex items-center justify-start gap-3">
                  <div className="w-12 h-12 relative bg-white rounded-full p-1 shrink-0 overflow-hidden border border-border/50 shadow-sm">
                    <Image
                      src={getTeamLogo(game.away_team_id)}
                      alt={game.away_team}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <span className="font-bold text-foreground text-lg hidden md:block">
                    {game.away_team}
                  </span>
                  <span className="font-bold text-foreground text-lg md:hidden">
                    {game.away_team.substring(0, 3).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border pt-4 md:pt-0">
                <div className="text-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                    Predicted Winner
                  </span>
                  <span
                    className={`font-bold text-lg ${game.win_probability > 0.7 ? "text-green-500" : "text-primary"}`}
                  >
                    {game.predicted_winner}
                  </span>
                </div>

                <div className="text-center w-32">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Confidence
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {(game.win_probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-secondary/50 rounded-full overflow-hidden ring-1 ring-border/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${game.win_probability > 0.7 ? "bg-green-500" : "bg-primary"}`}
                      style={{ width: `${game.win_probability * 100}%` }}
                    />
                  </div>
                </div>

                <button className="p-2 hover:bg-primary hover:text-primary-foreground rounded-full text-muted-foreground transition-all duration-300 md:ml-2 group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
