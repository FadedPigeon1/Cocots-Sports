"use client";

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
import { Plus, X, Search, User, TrendingUp } from "lucide-react";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/constants/nba-teams";
import type { PlayerData, ComparisonData } from "@/lib/types/player";

interface PlayerCompareTabProps {
  selectedPlayers: number[];
  comparisonData: {
    players: PlayerData[];
    comparison_data: ComparisonData[];
  } | null;
  loading: boolean;
  season: string;
  availableSeasons: string[];
  filteredPlayers: {
    PLAYER_ID: number;
    PLAYER_NAME: string;
    TEAM_ABBREVIATION: string;
  }[];
  showPlayerSearch: boolean;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onAddPlayer: (playerId: number) => void;
  onRemovePlayer: (playerId: number) => void;
  onToggleSearch: () => void;
  onSeasonChange: (season: string) => void;
}

function prepareGameChartData(
  comparisonData: PlayerCompareTabProps["comparisonData"],
) {
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
}

export default function PlayerCompareTab({
  selectedPlayers,
  comparisonData,
  loading,
  season,
  availableSeasons,
  filteredPlayers,
  showPlayerSearch,
  searchTerm,
  onSearchTermChange,
  onAddPlayer,
  onRemovePlayer,
  onToggleSearch,
  onSeasonChange,
}: PlayerCompareTabProps) {
  return (
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
                  onClick={() => onRemovePlayer(player.player_id)}
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
                  onClick={onToggleSearch}
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
                          onChange={(e) => onSearchTermChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                      {filteredPlayers.slice(0, 20).map((player) => (
                        <button
                          key={player.PLAYER_ID}
                          onClick={() => onAddPlayer(player.PLAYER_ID)}
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
                onChange={(e) => onSeasonChange(e.target.value)}
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
                    data={prepareGameChartData(comparisonData)}
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
                        ...CHART_TOOLTIP_STYLE,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
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
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
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
                  <BarChart data={comparisonData.comparison_data} barGap={8}>
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
                        ...CHART_TOOLTIP_STYLE,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
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
            Select up to 5 players to compare their stats, performance trends,
            and efficiency metrics head-to-head.
          </p>
          <button
            onClick={onToggleSearch}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 font-medium"
          >
            Select First Player
          </button>
        </div>
      )}
    </>
  );
}
