"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";
import {
  Target,
  TrendingUp,
  Calendar,
  ArrowRight,
  Zap,
  X,
  Activity,
  Brain,
  Trophy,
  Swords,
  ChevronDown,
} from "lucide-react";
import { getPredictions, getTeams, predictGame } from "@/lib/api/predictions";

import Image from "next/image";

interface Prediction {
  date: string;
  home_team: string;
  home_team_id: number;
  away_team: string;
  away_team_id: number;
  predicted_winner: string;
  win_probability: number;
}

interface Team {
  id: number;
  full_name: string;
  abbreviation: string;
}

type GameCount = 3 | 6 | 9;

const getTeamLogo = (teamId: number) => {
  return `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`;
};

export default function Predictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameCount, setGameCount] = useState<GameCount>(3);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  // Simulator State
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedHome, setSelectedHome] = useState<string>("");
  const [selectedAway, setSelectedAway] = useState<string>("");
  const [simulatorGamesBack, setSimulatorGamesBack] = useState<GameCount>(3);
  const [simulatedResult, setSimulatedResult] = useState<Prediction | null>(
    null,
  );
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    async function fetchPredictions() {
      setLoading(true);
      try {
        const [data, teamsData] = await Promise.all([
          getPredictions(gameCount),
          getTeams(),
        ]);
        setPredictions(data);
        setTeams(teamsData);
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPredictions();
  }, [gameCount]);

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

  const chartData = [
    { name: "Mon", accuracy: 65 },
    { name: "Tue", accuracy: 59 },
    { name: "Wed", accuracy: 80 },
    { name: "Thu", accuracy: 81 },
    { name: "Fri", accuracy: 56 },
    { name: "Sat", accuracy: 55 },
    { name: "Sun", accuracy: 78 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Predictions</h1>
        <p className="text-muted-foreground mt-2">
          Machine learning powered game analysis and outcome forecasts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="col-span-1 lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Model Accuracy Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e720" />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "8px",
                    color: "#f4f4f5",
                  }}
                  itemStyle={{ color: "#e4e4e7" }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Today&apos;s Summary
            </h3>
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground text-sm">
                  Total Games
                </span>
                <span className="font-bold text-foreground">8</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground text-sm">
                  High Confidence (&gt;70%)
                </span>
                <span className="font-bold text-green-500">3 games</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">
                  Avg. Win Probability
                </span>
                <span className="font-bold text-foreground">64%</span>
              </div>
            </div>

            <button
              onClick={() => setShowAnalysis(true)}
              className="w-full mt-6 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              View Detailed Analysis
            </button>
            <button
              onClick={() => setShowSimulator(true)}
              className="w-full mt-2 bg-secondary text-secondary-foreground py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
            >
              <Swords className="h-4 w-4" />
              Simulate Matchup
            </button>
          </div>
        </div>
      </div>

      {/* Predictions List */}
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
                onClick={() => setGameCount(count)}
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

      {showSimulator && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowSimulator(false);
                setSimulatedResult(null);
                setSelectedHome("");
                setSelectedAway("");
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
      )}

      {showAnalysis && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAnalysis(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  AI Performance Analysis
                </h2>
                <p className="text-muted-foreground text-sm">
                  Deep dive into today&apos;s model predictions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Confidence Distribution Chart */}
              <div className="bg-secondary/20 p-6 rounded-xl border border-border">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
                  <Target className="h-5 w-5 text-blue-500" />
                  Confidence Distribution
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { range: "50-60%", count: 2 },
                        { range: "60-70%", count: 3 },
                        { range: "70-80%", count: 2 },
                        { range: "80%+", count: 1 },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e4e4e720"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="range"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          borderRadius: "8px",
                        }}
                        cursor={{ fill: "transparent" }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {[
                          { range: "50-60%", count: 2 },
                          { range: "60-70%", count: 3 },
                          { range: "70-80%", count: 2 },
                          { range: "80%+", count: 1 },
                        ].map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 3 ? "#22c55e" : "#3b82f6"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Key Factors */}
              <div className="space-y-6">
                <div className="bg-secondary/20 p-6 rounded-xl border border-border">
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Model Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                      <div>
                        <span className="font-medium text-foreground block">
                          Home Court Advantage
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Teams playing at home are seeing a +4.2% win rate
                          increase today.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                      <div>
                        <span className="font-medium text-foreground block">
                          Defense Efficiency
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Defensive rating is weighted 15% higher in
                          today&apos;s matchups.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2" />
                      <div>
                        <span className="font-medium text-foreground block">
                          Rest Days
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Teams with 2+ days rest are favored in 3 of 4
                          matchups.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/20 p-6 rounded-xl border border-border">
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Top Pick of the Day
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-xl">LAL</div>
                      <div className="text-xs text-muted-foreground">vs</div>
                      <div className="font-bold text-xl text-muted-foreground">
                        BOS
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-500">
                        82%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Confidence
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-red-500" />
                Live Model Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground">Log Loss</div>
                  <div className="text-xl font-bold">0.423</div>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground">ROC AUC</div>
                  <div className="text-xl font-bold">0.781</div>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground">
                    Brier Score
                  </div>
                  <div className="text-xl font-bold">0.152</div>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground">
                    Training Samples
                  </div>
                  <div className="text-xl font-bold">12,450</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
