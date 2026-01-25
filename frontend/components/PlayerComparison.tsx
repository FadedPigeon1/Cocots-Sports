"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Plus, X, Search, User, TrendingUp, History } from "lucide-react";
import { comparePlayers, getPlayerHistory, getPlayers } from "@/lib/api/client";

interface PlayerData {
  player_id: number;
  name: string;
  team: string;
  team_id: number;
  position: string;
  season: string;
  games_played: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  mpg: number;
  tov: number;
  game_data: {
    game_num: number;
    pts: number;
    reb: number;
    ast: number;
    date: string;
  }[];
}

interface SeasonData {
  season: string;
  games_played: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  mpg: number;
  game_data: { game_num: number; pts: number; reb: number; ast: number }[];
}

interface ComparisonData {
  stat: string;
  [key: string]: string | number;
}

// Colors for different players/seasons in charts
const CHART_COLORS = ["#39FF14", "#3b82f6", "#f97316", "#ef4444", "#8b5cf6"];

export default function PlayerComparison() {
  const [allPlayers, setAllPlayers] = useState<
    { PLAYER_ID: number; PLAYER_NAME: string; TEAM_ABBREVIATION: string }[]
  >([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<{
    players: PlayerData[];
    comparison_data: ComparisonData[];
  } | null>(null);
  const [historyData, setHistoryData] = useState<{
    player: { id: number; name: string; team: string; position: string };
    seasons: SeasonData[];
    comparison_data: ComparisonData[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<"compare" | "history">("compare");
  const [historyPlayer, setHistoryPlayer] = useState<number | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([
    "2023-24",
    "2024-25",
    "2025-26",
  ]);
  const [season, setSeason] = useState("2025-26");

  // Available seasons for history comparison
  const availableSeasons = [
    "2015-16",
    "2016-17",
    "2017-18",
    "2018-19",
    "2019-20",
    "2020-21",
    "2021-22",
    "2022-23",
    "2023-24",
    "2024-25",
    "2025-26",
  ];

  // Fetch all players on mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await getPlayers();
        setAllPlayers(data);
      } catch (error) {
        console.error("Failed to fetch players:", error);
      }
    };
    fetchPlayers();
  }, []);

  // Fetch comparison data when players change
  useEffect(() => {
    const fetchComparison = async () => {
      if (selectedPlayers.length < 1) {
        setComparisonData(null);
        return;
      }

      setLoading(true);
      try {
        const data = await comparePlayers(selectedPlayers, season);
        setComparisonData(data);
      } catch (error) {
        console.error("Failed to fetch comparison:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "compare") {
      fetchComparison();
    }
  }, [selectedPlayers, season, activeTab]);

  // Fetch history data when history player changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!historyPlayer) {
        setHistoryData(null);
        return;
      }

      setLoading(true);
      try {
        const data = await getPlayerHistory(historyPlayer, selectedSeasons);
        setHistoryData(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "history") {
      fetchHistory();
    }
  }, [historyPlayer, selectedSeasons, activeTab]);

  const filteredPlayers = allPlayers.filter(
    (player) =>
      player.PLAYER_NAME.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedPlayers.includes(player.PLAYER_ID),
  );

  const addPlayer = (playerId: number) => {
    if (selectedPlayers.length < 5 && !selectedPlayers.includes(playerId)) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
    setShowPlayerSearch(false);
    setSearchTerm("");
  };

  const removePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
  };

  const toggleSeason = (season: string) => {
    if (selectedSeasons.includes(season)) {
      if (selectedSeasons.length > 1) {
        setSelectedSeasons(selectedSeasons.filter((s) => s !== season));
      }
    } else {
      setSelectedSeasons([...selectedSeasons, season].sort());
    }
  };

  // Prepare game-by-game chart data for comparison
  const prepareGameChartData = () => {
    if (!comparisonData || comparisonData.players.length === 0) return [];

    const maxGames = Math.max(
      ...comparisonData.players.map((p) => p.game_data?.length || 0),
    );
    const chartData = [];

    for (let i = 0; i < maxGames; i++) {
      const dataPoint: Record<string, number> = { game_num: i + 1 };
      comparisonData.players.forEach((player) => {
        if (player.game_data && player.game_data[i]) {
          dataPoint[`${player.name}_pts`] = player.game_data[i].pts;
        }
      });
      chartData.push(dataPoint);
    }

    return chartData;
  };

  // Prepare history chart data
  const prepareHistoryChartData = () => {
    if (!historyData || historyData.seasons.length === 0) return [];

    const maxGames = Math.max(
      ...historyData.seasons.map((s) => s.game_data?.length || 0),
    );
    const chartData = [];

    for (let i = 0; i < maxGames; i++) {
      const dataPoint: Record<string, number> = { game_num: i + 1 };
      historyData.seasons.forEach((season) => {
        if (season.game_data && season.game_data[i]) {
          dataPoint[`${season.season}_pts`] = season.game_data[i].pts;
        }
      });
      chartData.push(dataPoint);
    }

    return chartData;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl border border-border p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Player Comparison
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Compare players head-to-head or track a player across seasons
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-secondary/50 rounded-lg p-1 border border-border">
            <button
              onClick={() => setActiveTab("compare")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "compare"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Compare Players
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "history"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <History className="h-4 w-4 inline mr-2" />
              Season History
            </button>
          </div>
        </div>
      </div>

      {/* Compare Players Tab */}
      {activeTab === "compare" && (
        <>
          {/* Player Selection */}
          <div className="glass-card rounded-xl p-6 relative z-20">
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
              <div className="flex flex-wrap items-center gap-3 w-full">
                {/* Selected Players */}
                {comparisonData?.players.map((player, idx) => (
                  <div
                    key={player.player_id}
                    className="flex items-center gap-2 bg-secondary/80 border border-border px-3 py-2 rounded-lg shadow-sm animate-in fade-in zoom-in duration-200"
                    style={{ borderLeft: `3px solid ${CHART_COLORS[idx]}` }}
                  >
                    <div>
                      <span className="font-semibold text-sm block text-foreground leading-none">
                        {player.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {player.team}
                      </span>
                    </div>
                    <button
                      onClick={() => removePlayer(player.player_id)}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-1 p-0.5 rounded-full hover:bg-destructive/10"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add Player Button */}
                {selectedPlayers.length < 5 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowPlayerSearch(!showPlayerSearch)}
                      className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/20 transition-all duration-200 text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Add Player
                    </button>

                    {/* Player Search Dropdown */}
                    {showPlayerSearch && (
                      <div className="absolute top-full mt-2 left-0 w-80 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b border-border bg-secondary/30">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Search players..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                          {filteredPlayers.slice(0, 20).map((player) => (
                            <button
                              key={player.PLAYER_ID}
                              onClick={() => addPlayer(player.PLAYER_ID)}
                              className="w-full px-4 py-3 text-left hover:bg-primary/10 hover:text-primary transition-colors flex justify-between items-center group border-b border-border/40 last:border-0"
                            >
                              <span className="text-sm font-medium">
                                {player.PLAYER_NAME}
                              </span>
                              <span className="text-xs text-muted-foreground group-hover:text-primary/70">
                                {player.TEAM_ABBREVIATION}
                              </span>
                            </button>
                          ))}
                          {filteredPlayers.length === 0 && (
                            <div className="px-4 py-8 text-center">
                              <p className="text-sm text-muted-foreground">
                                No players found
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Season Selector */}
              <div className="min-w-[140px]">
                <div className="relative">
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full appearance-none bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    {availableSeasons.slice(-5).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Charts */}
          {loading ? (
            <div className="glass-card rounded-xl p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary/40" />
                </div>
              </div>
              <p className="text-muted-foreground mt-6 font-medium">
                Crunching the numbers...
              </p>
            </div>
          ) : comparisonData && comparisonData.players.length > 0 ? (
            <>
              {/* Stats Comparison Table */}
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Season Averages
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/30">
                        <th className="text-left py-4 px-6 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          Player
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          GP
                        </th>
                        <th className="text-center py-4 px-4 font-semibold uppercase tracking-wider text-xs text-foreground bg-primary/5">
                          PPG
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          RPG
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          APG
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          SPG
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          BPG
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          FG%
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          3P%
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          MPG
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {comparisonData.players.map((player, idx) => (
                        <tr
                          key={player.player_id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-2 h-8 rounded-full"
                                style={{ backgroundColor: CHART_COLORS[idx] }}
                              />
                              <div>
                                <span className="font-semibold text-foreground block">
                                  {player.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {player.team} • {player.position}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4 text-muted-foreground">
                            {player.games_played}
                          </td>
                          <td className="text-center py-4 px-4 font-bold text-foreground bg-primary/5 text-base">
                            {player.ppg}
                          </td>
                          <td className="text-center py-4 px-4 text-foreground">
                            {player.rpg}
                          </td>
                          <td className="text-center py-4 px-4 text-foreground">
                            {player.apg}
                          </td>
                          <td className="text-center py-4 px-4 text-foreground">
                            {player.spg}
                          </td>
                          <td className="text-center py-4 px-4 text-foreground">
                            {player.bpg}
                          </td>
                          <td className="text-center py-4 px-4 text-foreground font-mono">
                            {player.fg_pct}%
                          </td>
                          <td className="text-center py-4 px-4 text-foreground font-mono">
                            {player.fg3_pct}%
                          </td>
                          <td className="text-center py-4 px-4 text-muted-foreground">
                            {player.mpg}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scoring Trend Chart */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-bold text-foreground mb-6">
                    Points Per Game Trend
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={prepareGameChartData()}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="game_num"
                          stroke="var(--muted-foreground)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tick={{ dy: 10 }}
                        />
                        <YAxis
                          stroke="var(--muted-foreground)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tick={{ dx: -10 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                            color: "var(--foreground)",
                          }}
                          itemStyle={{ paddingBottom: "4px" }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        {comparisonData.players.map((player, idx) => (
                          <Line
                            key={player.player_id}
                            type="monotone"
                            dataKey={`${player.name}_pts`}
                            name={player.name}
                            stroke={CHART_COLORS[idx]}
                            strokeWidth={3}
                            dot={{
                              r: 4,
                              strokeWidth: 0,
                              fill: CHART_COLORS[idx],
                            }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-bold text-foreground mb-6">
                    Stats Comparison
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={comparisonData.comparison_data}
                      >
                        <PolarGrid stroke="var(--border)" opacity={0.5} />
                        <PolarAngleAxis
                          dataKey="stat"
                          tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, "auto"]}
                          tick={false}
                          axisLine={false}
                        />
                        {comparisonData.players.map((player, idx) => (
                          <Radar
                            key={player.player_id}
                            name={player.name}
                            dataKey={player.name}
                            stroke={CHART_COLORS[idx]}
                            fill={CHART_COLORS[idx]}
                            fillOpacity={0.2}
                          />
                        ))}
                        <Legend wrapperStyle={{ paddingTop: "10px" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            color: "var(--foreground)",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart Comparison */}
                <div className="glass-card rounded-xl p-6 lg:col-span-2">
                  <h3 className="text-lg font-bold text-foreground mb-6">
                    Category Leaderboard
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonData.comparison_data}
                        barGap={8}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="stat"
                          stroke="var(--muted-foreground)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tick={{ dy: 10 }}
                        />
                        <YAxis
                          stroke="var(--muted-foreground)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "var(--secondary)", opacity: 0.2 }}
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                            color: "var(--foreground)",
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        {comparisonData.players.map((player, idx) => (
                          <Bar
                            key={player.player_id}
                            dataKey={player.name}
                            fill={CHART_COLORS[idx]}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card rounded-xl p-20 text-center flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 bg-secondary/5">
              <div className="bg-secondary/20 p-6 rounded-full mb-6">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Start Comparing
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                Select up to 5 players to compare their stats, performance
                trends, and efficiency metrics head-to-head.
              </p>
              <button
                onClick={() => setShowPlayerSearch(true)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 font-medium"
              >
                Select First Player
              </button>
            </div>
          )}
        </>
      )}

      {/* Season History Tab */}
      {activeTab === "history" && (
        <>
          {/* Player & Season Selection */}
          <div className="glass-card rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Player Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Player
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={historyPlayer || ""}
                    onChange={(e) =>
                      setHistoryPlayer(
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                    className="w-full appearance-none pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all hover:bg-secondary/80"
                  >
                    <option value="">Select a player...</option>
                    {allPlayers.slice(0, 50).map((player) => (
                      <option key={player.PLAYER_ID} value={player.PLAYER_ID}>
                        {player.PLAYER_NAME} ({player.TEAM_ABBREVIATION})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Season Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Compare Seasons
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSeasons.slice(-6).map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSeason(s)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border ${
                        selectedSeasons.includes(s)
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80 hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History Charts */}
          {loading ? (
            <div className="glass-card rounded-xl p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-muted-foreground mt-6 font-medium">
                Loading history data...
              </p>
            </div>
          ) : historyData && historyData.seasons.length > 0 ? (
            <>
              {/* Player Info */}
              <div className="glass-card rounded-xl p-6 bg-linear-to-r from-secondary/50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {historyData.player.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {historyData.player.name}
                    </h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                      <span className="bg-secondary px-2 py-0.5 rounded text-xs">
                        {historyData.player.team}
                      </span>
                      <span>•</span>
                      <span>{historyData.player.position}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Table */}
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-bold text-foreground">
                    Season-by-Season Stats
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/30">
                        <th className="text-left py-4 px-6 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          Season
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          GP
                        </th>
                        <th className="text-center py-4 px-4 font-semibold uppercase tracking-wider text-xs text-foreground bg-primary/5">
                          PPG
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          RPG
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          APG
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          SPG
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          BPG
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          FG%
                        </th>
                        <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                          3P%
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {historyData.seasons.map((season, idx) => (
                        <tr
                          key={season.season}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-2 h-8 rounded-full"
                                style={{ backgroundColor: CHART_COLORS[idx] }}
                              />
                              <span className="font-semibold text-foreground">
                                {season.season}
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4 text-muted-foreground">
                            {season.games_played}
                          </td>
                          <td className="text-center py-4 px-4 font-bold text-foreground bg-primary/5 text-base">
                            {season.ppg}
                          </td>
                          <td className="text-center py-4 px-4 text-foreground">
                            {season.rpg}
                          </td>
                          <td className="text-center py-4 px-4 text-foreground">
                            {season.apg}
                          </td>
                          <td className="text-center py-4 px-4 text-foreground">
                            {season.spg}
                          </td>
                          <td className="text-center py-4 px-4 text-foreground">
                            {season.bpg}
                          </td>
                          <td className="text-center py-4 px-4 text-foreground font-mono">
                            {season.fg_pct}%
                          </td>
                          <td className="text-center py-4 px-4 text-foreground font-mono">
                            {season.fg3_pct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scoring Trend by Season */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-bold text-foreground mb-6">
                    Points Per Game by Season
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={prepareHistoryChartData()}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="game_num"
                          stroke="var(--muted-foreground)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="var(--muted-foreground)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                            color: "var(--foreground)",
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        {historyData.seasons.map((season, idx) => (
                          <Line
                            key={season.season}
                            type="monotone"
                            dataKey={`${season.season}_pts`}
                            name={season.season}
                            stroke={CHART_COLORS[idx]}
                            strokeWidth={3}
                            dot={{
                              r: 3,
                              strokeWidth: 0,
                              fill: CHART_COLORS[idx],
                            }}
                            activeDot={{ r: 5, strokeWidth: 0 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart Comparison */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-bold text-foreground mb-6">
                    Season Comparison
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historyData.comparison_data} barGap={8}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="stat"
                          stroke="var(--muted-foreground)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="var(--muted-foreground)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                            color: "var(--foreground)",
                          }}
                          cursor={{ fill: "var(--secondary)", opacity: 0.2 }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        {historyData.seasons.map((season, idx) => (
                          <Bar
                            key={season.season}
                            dataKey={season.season}
                            fill={CHART_COLORS[idx]}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card rounded-xl p-20 text-center flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 bg-secondary/5">
              <div className="bg-secondary/20 p-6 rounded-full mb-6">
                <History className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Track Development
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Select a player to analyze how their game has evolved over
                different seasons.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
