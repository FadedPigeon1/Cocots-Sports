"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Trophy,
  Users,
  Loader2,
  RefreshCw,
  Flame,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface TeamDetails {
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

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;

  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [gameLogs, setGameLogs] = useState<GameLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  useEffect(() => {
    // Auto-refresh every 3 minutes
    const interval = setInterval(() => {
      if (teamId) {
        fetchTeamData(true);
      }
    }, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, [teamId]);

  const fetchTeamData = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/team/${teamId}?season=2025-26&_t=${Date.now()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch team data");
      }

      const data = await response.json();
      setTeamDetails(data.team);
      setGameLogs(data.recent_games || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching team data:", err);
      setError("Failed to load team data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchTeamData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-neon-green animate-spin" />
          <p className="text-gray-400">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (error || !teamDetails) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Team not found"}</p>
          <Link
            href="/"
            className="text-neon-green hover:underline flex items-center gap-2 justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Standings
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data - keep most recent games first, don't reverse
  const last10Games = gameLogs.slice(0, 10);

  // For chart display, reverse to show progression left to right
  const performanceData = [...last10Games].reverse().map((game, idx) => ({
    game: `G${idx + 1}`,
    points: game.pts,
    opponent_points: game.opp_pts,
    fg_pct: game.fg_pct * 100,
  }));

  const statsRadarData = [
    { stat: "Scoring", value: (teamDetails.ppg / 130) * 100 },
    { stat: "Defense", value: (1 - teamDetails.opp_ppg / 130) * 100 },
    { stat: "FG%", value: teamDetails.fg_pct * 100 },
    { stat: "3PT%", value: teamDetails.fg3_pct * 100 },
    { stat: "FT%", value: teamDetails.ft_pct * 100 },
    { stat: "Rebounds", value: (teamDetails.reb / 50) * 100 },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-neon-green/20 backdrop-blur-sm bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-white hover:text-neon-green transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Standings</span>
            </Link>
            <div className="flex gap-6">
              <Link
                href="/predictions"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
                Predictions
              </Link>
              <Link
                href="/teams"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
                Recent Games
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Team Header */}
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24">
              <Image
                src={`https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`}
                alt={teamDetails.team_name}
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">
                {teamDetails.team_name}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-2xl text-gray-400">2025-26 Season Stats</p>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                    <span className="text-gray-400">Live Data</span>
                  </div>
                  {lastUpdated && (
                    <span className="text-gray-500">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1 text-gray-400 hover:text-neon-green transition-colors disabled:opacity-50"
                    title="Refresh data"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-900/50 border border-neon-green/20 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Overall Record</div>
              <div className="text-3xl font-bold text-white">
                {teamDetails.wins}-{teamDetails.losses}
              </div>
              <div className="text-neon-green text-sm mt-1">
                {(teamDetails.win_pct * 100).toFixed(1)}% Win Rate
              </div>
            </div>

            <div className="bg-gray-900/50 border border-neon-green/20 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Conf. Rank</div>
              <div className="text-3xl font-bold text-white">
                #{teamDetails.conf_rank}
              </div>
              <div className="text-gray-500 text-sm mt-1">
                Last 10: {teamDetails.last_10}
              </div>
            </div>

            <div className="bg-gray-900/50 border border-neon-green/20 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">PPG</div>
              <div className="text-3xl font-bold text-white">
                {teamDetails.ppg.toFixed(1)}
              </div>
              <div className="text-gray-500 text-sm mt-1">
                Opp: {teamDetails.opp_ppg.toFixed(1)}
              </div>
            </div>

            <div className="bg-gray-900/50 border border-neon-green/20 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Streak</div>
              <div className="flex items-center gap-2">
                {teamDetails.streak.startsWith("W") ? (
                  <Flame className="h-6 w-6 text-orange-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                )}
                <div className="text-3xl font-bold text-white">
                  {teamDetails.streak}
                </div>
              </div>
              <div className="text-gray-500 text-sm mt-1">Current Streak</div>
            </div>

            <div className="bg-gray-900/50 border border-neon-green/20 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Home/Away</div>
              <div className="text-xl font-bold text-white">
                {teamDetails.home_record}
              </div>
              <div className="text-gray-500 text-sm mt-1">Home</div>
              <div className="text-xl font-bold text-white mt-1">
                {teamDetails.away_record}
              </div>
              <div className="text-gray-500 text-sm">Away</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Performance Trend */}
          <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-neon-green" />
              Last 10 Games Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="game" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #39FF14",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="#39FF14"
                  strokeWidth={2}
                  name="Team Points"
                />
                <Line
                  type="monotone"
                  dataKey="opponent_points"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Opp Points"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Team Stats Radar */}
          <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-neon-green" />
              Overall Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={statsRadarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="stat" stroke="#9CA3AF" />
                <PolarRadiusAxis stroke="#9CA3AF" />
                <Radar
                  name="Team Stats"
                  dataKey="value"
                  stroke="#39FF14"
                  fill="#39FF14"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shooting Stats */}
        <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="h-6 w-6 text-neon-green" />
            Shooting Statistics
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {(teamDetails.fg_pct * 100).toFixed(1)}%
              </div>
              <div className="text-gray-400">Field Goal %</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                <div
                  className="bg-neon-green h-2 rounded-full"
                  style={{ width: `${teamDetails.fg_pct * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {(teamDetails.fg3_pct * 100).toFixed(1)}%
              </div>
              <div className="text-gray-400">Three Point %</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                <div
                  className="bg-neon-green h-2 rounded-full"
                  style={{ width: `${teamDetails.fg3_pct * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {(teamDetails.ft_pct * 100).toFixed(1)}%
              </div>
              <div className="text-gray-400">Free Throw %</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                <div
                  className="bg-neon-green h-2 rounded-full"
                  style={{ width: `${teamDetails.ft_pct * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Games */}
        <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-neon-green" />
              Recent Games ({gameLogs.length} matches)
            </h2>
            {isRefreshing && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {gameLogs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No recent games available
              </div>
            ) : (
              last10Games.map((game, idx) => {
                const isWin = game.result === "W";
                const margin = Math.abs(game.pts - game.opp_pts);
                const isHome = game.location === "vs";
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      isWin
                        ? "bg-green-900/20 border border-green-500/30 hover:bg-green-900/30"
                        : "bg-red-900/20 border border-red-500/30 hover:bg-red-900/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`text-2xl font-bold ${
                            isWin ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {game.result}
                        </span>
                        <span className="text-xs text-gray-500">
                          Game {idx + 1}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          <span className="text-gray-400 text-sm">
                            {game.location || "vs"}
                          </span>
                          <span>{game.opponent}</span>
                          {isHome ? (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                              HOME
                            </span>
                          ) : (
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                              AWAY
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-sm">{game.date}</div>
                      </div>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <div
                        className={`font-bold text-lg ${
                          isWin ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {game.pts} - {game.opp_pts}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {isWin ? "+" : "-"}
                        {margin} • {(game.fg_pct * 100).toFixed(1)}% FG
                      </div>
                      {game.reb !== undefined && game.ast !== undefined && (
                        <div className="text-gray-500 text-xs mt-1">
                          {game.reb} REB • {game.ast} AST
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
