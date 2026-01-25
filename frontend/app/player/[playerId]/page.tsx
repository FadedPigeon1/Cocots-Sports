"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Activity,
  Target,
  Trophy,
  Calendar,
  MapPin,
  User,
  Ruler,
  Weight,
  Shirt,
  Flag,
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
} from "recharts";
import { getPlayer } from "@/lib/api/client";

interface PlayerDetails {
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

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.playerId as string;

  const [player, setPlayer] = useState<PlayerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getPlayer(playerId);
        setPlayer(data);
      } catch (err) {
        console.error("Error fetching player:", err);
        setError("Failed to load player data");
      } finally {
        setLoading(false);
      }
    }
    if (playerId) {
      fetchData();
    }
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">
            Loading Player Stats...
          </p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card text-card-foreground p-8 rounded-xl border border-border max-w-md w-full text-center shadow-lg">
          <div className="bg-destructive/10 text-destructive p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Player Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || "Could not retrieve player details"}
          </p>
          <Link
            href="/players"
            className="inline-flex items-center gap-2 text-primary hover:underline justify-center font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Players
          </Link>
        </div>
      </div>
    );
  }

  const chartData = [...player.recent_games].reverse().map((game, idx) => ({
    game: `G${idx + 1}`,
    pts: game.pts,
    reb: game.reb,
    ast: game.ast,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Hero Section */}
      <div className="relative bg-muted/30 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <Link
            href="/players"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Players
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            {/* Player Headshot */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 -mb-8 z-10">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-0 opacity-20 rounded-full md:rounded-none" />
              <Image
                src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.info.id}.png`}
                alt={player.info.name}
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>

            <div className="flex-1 space-y-6 pb-8 text-center md:text-left">
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-2">
                  {player.info.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-lg text-muted-foreground">
                  <span className="font-semibold text-primary">
                    #{player.info.jersey}
                  </span>
                  <span>•</span>
                  <span>{player.info.position}</span>
                  <span>•</span>
                  <Link
                    href={`/team/${player.info.team_id}`}
                    className="hover:text-primary transition-colors hover:underline"
                  >
                    {player.info.team}
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  {player.info.height}
                </div>
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  {player.info.weight} lbs
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  {player.info.country}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {player.info.experience} Yrs Exp
                </div>
              </div>
            </div>

            {/* Quick Season Stats */}
            <div className="grid grid-cols-3 gap-4 pb-8 w-full md:w-auto">
              <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm min-w-[100px]">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  PTS
                </div>
                <div className="text-3xl font-bold flex flex-col">
                  {player.stats.ppg.toFixed(1)}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm min-w-[100px]">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  REB
                </div>
                <div className="text-3xl font-bold">
                  {player.stats.rpg.toFixed(1)}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm min-w-[100px]">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  AST
                </div>
                <div className="text-3xl font-bold">
                  {player.stats.apg.toFixed(1)}
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
                <Activity className="h-5 w-5 text-primary" />
                Recent Performance Trend
              </h3>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      color: "#fafafa",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Line
                    type="monotone"
                    dataKey="pts"
                    name="Points"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#3b82f6",
                      strokeWidth: 2,
                      stroke: "#09090b",
                    }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reb"
                    name="Rebounds"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ast"
                    name="Assists"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shooting Splits */}
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
                      {(player.stats.fg_pct * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${player.stats.fg_pct * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">3-Point</span>
                    <span className="font-bold">
                      {(player.stats.fg3_pct * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${player.stats.fg3_pct * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Free Throw</span>
                    <span className="font-bold">
                      {(player.stats.ft_pct * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${player.stats.ft_pct * 100}%` }}
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
                    {Math.max(...player.recent_games.map((g) => g.pts))}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Points
                  </div>
                </div>
                <div className="bg-secondary/30 p-3 rounded-lg">
                  <div className="text-2xl font-bold">
                    {Math.max(...player.recent_games.map((g) => g.reb))}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Rebounds
                  </div>
                </div>
                <div className="bg-secondary/30 p-3 rounded-lg">
                  <div className="text-2xl font-bold">
                    {Math.max(...player.recent_games.map((g) => g.ast))}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Assists
                  </div>
                </div>
                <div className="bg-secondary/30 p-3 rounded-lg">
                  <div className="text-2xl font-bold">
                    {Math.max(...player.recent_games.map((g) => g.blk))}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Blocks
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Games Table */}
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
                {player.recent_games.map((game, idx) => (
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
                    <td className="px-4 py-3">
                      {(game.fg_pct * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{game.min}</td>
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
