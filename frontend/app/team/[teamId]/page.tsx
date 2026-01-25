"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  TrendingUp,
  Activity,
  Target,
  Trophy,
  Calendar,
  MapPin,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
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
import { getTeam } from "@/lib/api/client";

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

  const fetchTeamData = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getTeam(teamId);

      setTeamDetails(data.team);
      setGameLogs(data.recent_games || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching team data:", err);
      setError("Failed to load team data. Checking backend service...");
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">
            Analyzing Season Performance...
          </p>
        </div>
      </div>
    );
  }

  if (error || !teamDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card text-card-foreground p-8 rounded-xl border border-border max-w-md w-full text-center shadow-lg">
          <div className="bg-destructive/10 text-destructive p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Data Unavailable</h2>
          <p className="text-muted-foreground mb-6">
            {error || "Team not found"}
          </p>
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 text-primary hover:underline justify-center font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Team List
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
    margin: game.pts - game.opp_pts,
  }));

  const statsRadarData = [
    { stat: "Scoring", value: (teamDetails.ppg / 130) * 100, fullMark: 100 },
    {
      stat: "Defense",
      value: (1 - (teamDetails.opp_ppg - 90) / 50) * 100,
      fullMark: 100,
    }, // Normalize: Lower opp ppg is better
    { stat: "Win %", value: teamDetails.win_pct * 100, fullMark: 100 },
    { stat: "3PT %", value: (teamDetails.fg3_pct / 0.45) * 100, fullMark: 100 }, // Norm based on ~45% elite
    { stat: "Rebounds", value: (teamDetails.reb / 60) * 100, fullMark: 100 },
    {
      stat: "Streak",
      value: Math.min(
        teamDetails.streak.startsWith("W")
          ? parseInt(teamDetails.streak.substring(1)) * 10
          : 10,
        100,
      ),
      fullMark: 100,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Hero Header Section */}
      <div className="relative bg-muted/30 border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teams
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="relative w-32 h-32 md:w-40 md:h-40 bg-card rounded-full p-6 border-2 border-border shadow-xl shrink-0 flex items-center justify-center overflow-hidden">
              <Image
                src={`https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`}
                alt={teamDetails.team_name}
                fill
                className="object-contain p-4"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">
                  {teamDetails.team_name}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    2025-26 Season
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    Last 10:{" "}
                    <span className="text-foreground font-medium">
                      {teamDetails.last_10}
                    </span>
                  </span>
                  <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    {lastUpdated
                      ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : "Refresh"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:border-primary/50 transition-colors">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Record
                  </div>
                  <div className="text-2xl font-bold">
                    {teamDetails.wins}-{teamDetails.losses}
                  </div>
                  <div
                    className={`text-xs font-medium ${teamDetails.win_pct * 100 >= 50 ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {(teamDetails.win_pct * 100).toFixed(1)}% Win Rate
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:border-primary/50 transition-colors">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Conf Rank
                  </div>
                  <div className="text-2xl font-bold">
                    #{teamDetails.conf_rank}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    Streak:{" "}
                    <span
                      className={
                        teamDetails.streak.startsWith("W")
                          ? "text-emerald-500 font-bold"
                          : "text-rose-500 font-bold"
                      }
                    >
                      {teamDetails.streak}
                    </span>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:border-primary/50 transition-colors">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Scoring
                  </div>
                  <div className="text-2xl font-bold">
                    {teamDetails.ppg.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Points Per Game
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:border-primary/50 transition-colors">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Defense
                  </div>
                  <div className="text-2xl font-bold">
                    {teamDetails.opp_ppg.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Opp Points PG
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Performance Chart */}
          <div className="lg:col-span-2 card-base p-6 border border-border bg-card rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Trend (Last 10)
              </h3>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="game"
                    stroke="#a1a1aa"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#27272a" }}
                    dy={10}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b", // card
                      borderColor: "#27272a", // border
                      borderRadius: "8px",
                      color: "#fafafa", // foreground
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Line
                    type="monotone"
                    dataKey="points"
                    name="Team Points"
                    stroke="#3b82f6" // primary
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#3b82f6",
                      strokeWidth: 2,
                      stroke: "#09090b",
                    }} // primary, background
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="opponent_points"
                    name="Opponent Points"
                    stroke="#a1a1aa" // muted-foreground
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Team Profile
            </h3>
            <div className="h-[300px] w-full flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={statsRadarData}
                >
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis
                    dataKey="stat"
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name={teamDetails.team_name}
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-xs text-muted-foreground">
              Normalized relative to league averages
            </div>
          </div>
        </div>

        {/* Recent Games Table */}
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
      </div>
    </div>
  );
}
