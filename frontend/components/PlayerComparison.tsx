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
      <div className="bg-card rounded-xl border border-border p-6">
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
          <div className="flex bg-secondary rounded-lg p-1">
            <button
              onClick={() => setActiveTab("compare")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "compare"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Compare Players
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "history"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* Selected Players */}
              {comparisonData?.players.map((player, idx) => (
                <div
                  key={player.player_id}
                  className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg"
                  style={{ borderLeft: `3px solid ${CHART_COLORS[idx]}` }}
                >
                  <span className="text-sm font-medium text-foreground">
                    {player.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({player.team})
                  </span>
                  <button
                    onClick={() => removePlayer(player.player_id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Add Player Button */}
              {selectedPlayers.length < 5 && (
                <div className="relative">
                  <button
                    onClick={() => setShowPlayerSearch(!showPlayerSearch)}
                    className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/30 px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Player
                  </button>

                  {/* Player Search Dropdown */}
                  {showPlayerSearch && (
                    <div className="absolute top-full mt-2 left-0 w-72 bg-card border border-border rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b border-border">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search players..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredPlayers.slice(0, 20).map((player) => (
                          <button
                            key={player.PLAYER_ID}
                            onClick={() => addPlayer(player.PLAYER_ID)}
                            className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors flex justify-between items-center"
                          >
                            <span className="text-sm text-foreground">
                              {player.PLAYER_NAME}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {player.TEAM_ABBREVIATION}
                            </span>
                          </button>
                        ))}
                        {filteredPlayers.length === 0 && (
                          <p className="px-4 py-3 text-sm text-muted-foreground">
                            No players found
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Season Selector */}
              <div className="ml-auto">
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {availableSeasons.slice(-5).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Comparison Charts */}
          {loading ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">
                Loading comparison data...
              </p>
            </div>
          ) : comparisonData && comparisonData.players.length > 0 ? (
            <>
              {/* Stats Comparison Table */}
              <div className="bg-card rounded-xl border border-border p-6 overflow-x-auto">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Season Averages
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                        Player
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        GP
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        PPG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        RPG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        APG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        SPG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        BPG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        FG%
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        3P%
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        MPG
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.players.map((player, idx) => (
                      <tr
                        key={player.player_id}
                        className="border-b border-border/50 hover:bg-secondary/50"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[idx] }}
                            />
                            <span className="font-medium text-foreground">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {player.games_played}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground font-medium">
                          {player.ppg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {player.rpg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {player.apg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {player.spg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {player.bpg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {player.fg_pct}%
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {player.fg3_pct}%
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {player.mpg}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scoring Trend Chart */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Points Per Game Trend
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareGameChartData()}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="game_num"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        {comparisonData.players.map((player, idx) => (
                          <Line
                            key={player.player_id}
                            type="monotone"
                            dataKey={`${player.name}_pts`}
                            name={player.name}
                            stroke={CHART_COLORS[idx]}
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Stats Comparison
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={comparisonData.comparison_data}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis
                          dataKey="stat"
                          tick={{
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 12,
                          }}
                        />
                        <PolarRadiusAxis tick={false} />
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
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart Comparison */}
                <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Category Comparison
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData.comparison_data}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="stat"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        {comparisonData.players.map((player, idx) => (
                          <Bar
                            key={player.player_id}
                            dataKey={player.name}
                            fill={CHART_COLORS[idx]}
                            radius={[4, 4, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select players to compare their statistics
              </p>
            </div>
          )}
        </>
      )}

      {/* Season History Tab */}
      {activeTab === "history" && (
        <>
          {/* Player & Season Selection */}
          <div className="bg-card rounded-xl border border-border p-6">
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
                    className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a player...</option>
                    {allPlayers.slice(0, 50).map((player) => (
                      <option key={player.PLAYER_ID} value={player.PLAYER_ID}>
                        {player.PLAYER_NAME} ({player.TEAM_ABBREVIATION})
                      </option>
                    ))}
                  </select>
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
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        selectedSeasons.includes(s)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
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
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">
                Loading history data...
              </p>
            </div>
          ) : historyData && historyData.seasons.length > 0 ? (
            <>
              {/* Player Info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-xl font-bold text-foreground">
                  {historyData.player.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {historyData.player.team} • {historyData.player.position}
                </p>
              </div>

              {/* Stats Table */}
              <div className="bg-card rounded-xl border border-border p-6 overflow-x-auto">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Season-by-Season Stats
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                        Season
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        GP
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        PPG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        RPG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        APG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        SPG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        BPG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        FG%
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        3P%
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.seasons.map((season, idx) => (
                      <tr
                        key={season.season}
                        className="border-b border-border/50 hover:bg-secondary/50"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[idx] }}
                            />
                            <span className="font-medium text-foreground">
                              {season.season}
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.games_played}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground font-medium">
                          {season.ppg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.rpg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.apg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.spg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.bpg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.fg_pct}%
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.fg3_pct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scoring Trend by Season */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Points Per Game by Season
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareHistoryChartData()}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="game_num"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        {historyData.seasons.map((season, idx) => (
                          <Line
                            key={season.season}
                            type="monotone"
                            dataKey={`${season.season}_pts`}
                            name={season.season}
                            stroke={CHART_COLORS[idx]}
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart Comparison */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Season Comparison
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historyData.comparison_data}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="stat"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        {historyData.seasons.map((season, idx) => (
                          <Bar
                            key={season.season}
                            dataKey={season.season}
                            fill={CHART_COLORS[idx]}
                            radius={[4, 4, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a player to view their season history
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
