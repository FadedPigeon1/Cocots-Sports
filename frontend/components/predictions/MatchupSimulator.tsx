"use client";

import { useState } from "react";
import Image from "next/image";
import { Swords, Zap, Activity, ChevronDown, X } from "lucide-react";
import { predictGame } from "@/lib/api/predictions";

interface Team {
  id: number;
  full_name: string;
  abbreviation: string;
}

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

interface MatchupSimulatorProps {
  teams: Team[];
  onClose: () => void;
}

export default function MatchupSimulator({
  teams,
  onClose,
}: MatchupSimulatorProps) {
  const [selectedHome, setSelectedHome] = useState("");
  const [selectedAway, setSelectedAway] = useState("");
  const [simulatorGamesBack, setSimulatorGamesBack] = useState<GameCount>(3);
  const [simulatedResult, setSimulatedResult] = useState<Prediction | null>(
    null,
  );
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    if (!selectedHome || !selectedAway) return;
    setSimulating(true);
    try {
      const result = await predictGame({
        home_team_id: parseInt(selectedHome),
        away_team_id: parseInt(selectedAway),
        games_back: simulatorGamesBack,
      });

      setSimulatedResult({
        date: new Date().toISOString(),
        home_team: result.home_team_name || "Home",
        home_team_id: result.home_team_id,
        away_team: result.away_team_name || "Away",
        away_team_id: result.away_team_id,
        predicted_winner:
          result.home_win_probability > result.away_win_probability
            ? result.home_team_name || "Home"
            : result.away_team_name || "Away",
        win_probability: Math.max(
          result.home_win_probability,
          result.away_win_probability,
        ),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => {
            onClose();
          }}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-secondary rounded-full">
            <Swords className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Matchup Simulator
            </h2>
            <p className="text-muted-foreground text-sm">
              Simulate any matchup with custom analysis settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Home Team
            </label>
            <div className="relative">
              <select
                className="w-full p-3 bg-secondary rounded-lg appearance-none cursor-pointer hover:bg-secondary/80 transition-colors pr-10"
                value={selectedHome}
                onChange={(e) => {
                  setSelectedHome(e.target.value);
                  setSimulatedResult(null);
                }}
              >
                <option value="">Select Home Team</option>
                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                    disabled={String(team.id) === selectedAway}
                    className={
                      String(team.id) === selectedAway ? "opacity-50" : ""
                    }
                  >
                    {team.full_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Away Team
            </label>
            <div className="relative">
              <select
                className="w-full p-3 bg-secondary rounded-lg appearance-none cursor-pointer hover:bg-secondary/80 transition-colors pr-10"
                value={selectedAway}
                onChange={(e) => {
                  setSelectedAway(e.target.value);
                  setSimulatedResult(null);
                }}
              >
                <option value="">Select Away Team</option>
                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                    disabled={String(team.id) === selectedHome}
                    className={
                      String(team.id) === selectedHome ? "opacity-50" : ""
                    }
                  >
                    {team.full_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <label className="text-sm font-medium text-muted-foreground block">
            Analysis Depth (Recent Games)
          </label>
          <div className="flex gap-2">
            {([3, 6, 9] as GameCount[]).map((count) => (
              <button
                key={count}
                onClick={() => {
                  setSimulatorGamesBack(count);
                  setSimulatedResult(null);
                }}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all border-2 ${
                  simulatorGamesBack === count
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {count} Games
              </button>
            ))}
          </div>
        </div>

        {simulatedResult ? (
          <div className="bg-secondary/30 p-6 rounded-xl border border-border animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="flex items-center justify-between gap-4">
              <div className="text-center flex-1">
                <div className="w-16 h-16 mx-auto bg-white rounded-full p-2 mb-2 relative border border-border/50">
                  <Image
                    src={getTeamLogo(simulatedResult.home_team_id)}
                    alt="Home"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <h3 className="font-bold text-lg">
                  {simulatedResult.home_team}
                </h3>
                {simulatedResult.predicted_winner ===
                  simulatedResult.home_team && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-500 text-xs font-bold rounded">
                    WINNER
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-primary">
                  {(simulatedResult.win_probability * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Confidence
                </span>
                <div className="px-3 py-1 bg-background rounded-full text-xs font-mono text-muted-foreground">
                  VS
                </div>
              </div>

              <div className="text-center flex-1">
                <div className="w-16 h-16 mx-auto bg-white rounded-full p-2 mb-2 relative border border-border/50">
                  <Image
                    src={getTeamLogo(simulatedResult.away_team_id)}
                    alt="Away"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <h3 className="font-bold text-lg">
                  {simulatedResult.away_team}
                </h3>
                {simulatedResult.predicted_winner ===
                  simulatedResult.away_team && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-500 text-xs font-bold rounded">
                    WINNER
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleSimulate}
            disabled={simulating || !selectedHome || !selectedAway}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl text-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {simulating ? (
              <>
                <Activity className="h-5 w-5 animate-spin" />
                Simulating Matchup...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Run Simulation
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
