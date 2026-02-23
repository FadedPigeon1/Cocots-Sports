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
} from "recharts";
import { Search, History } from "lucide-react";
import {
  AVAILABLE_SEASONS,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/lib/constants/nba-teams";
import type { PlayerSeasonData, ComparisonData } from "@/lib/types/player";

interface PlayerHistoryTabProps {
  allPlayers: {
    PLAYER_ID: number;
    PLAYER_NAME: string;
    TEAM_ABBREVIATION: string;
  }[];
  historyPlayer: number | null;
  historyData: {
    player: { id: number; name: string; team: string; position: string };
    seasons: PlayerSeasonData[];
    comparison_data: ComparisonData[];
  } | null;
  loading: boolean;
  selectedSeasons: string[];
  onHistoryPlayerChange: (playerId: number | null) => void;
  onToggleSeason: (season: string) => void;
}

function prepareHistoryChartData(
  historyData: PlayerHistoryTabProps["historyData"],
) {
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
}

export default function PlayerHistoryTab({
  allPlayers,
  historyPlayer,
  historyData,
  loading,
  selectedSeasons,
  onHistoryPlayerChange,
  onToggleSeason,
}: PlayerHistoryTabProps) {
  return (
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
                  onHistoryPlayerChange(
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
              {AVAILABLE_SEASONS.slice(-6).map((s) => (
                <button
                  key={s}
                  onClick={() => onToggleSeason(s)}
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
                    data={prepareHistoryChartData(historyData)}
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
                        ...CHART_TOOLTIP_STYLE,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
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
                        ...CHART_TOOLTIP_STYLE,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
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
            Select a player to analyze how their game has evolved over different
            seasons.
          </p>
        </div>
      )}
    </>
  );
}
