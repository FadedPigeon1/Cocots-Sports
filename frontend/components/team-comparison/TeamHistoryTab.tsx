"use client";

import Image from "next/image";
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
import { History } from "lucide-react";
import {
  EASTERN_CONFERENCE,
  WESTERN_CONFERENCE,
  AVAILABLE_SEASONS,
  CHART_COLORS,
  getTeamLogo,
  CHART_TOOLTIP_STYLE,
} from "@/lib/constants/nba-teams";
import type { TeamSeasonData, ComparisonData } from "@/lib/types/team";

interface TeamHistoryTabProps {
  historyTeam: number | null;
  historyData: {
    team: { id: number; name: string; abbreviation: string };
    seasons: TeamSeasonData[];
    comparison_data: ComparisonData[];
  } | null;
  loading: boolean;
  selectedSeasons: string[];
  onHistoryTeamChange: (teamId: number | null) => void;
  onToggleSeason: (season: string) => void;
}

function prepareHistoryChartData(
  historyData: TeamHistoryTabProps["historyData"],
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
        dataPoint[`${season.season}_wins`] = season.game_data[i].wins;
      }
    });
    chartData.push(dataPoint);
  }

  return chartData;
}

export default function TeamHistoryTab({
  historyTeam,
  historyData,
  loading,
  selectedSeasons,
  onHistoryTeamChange,
  onToggleSeason,
}: TeamHistoryTabProps) {
  return (
    <>
      {/* Team & Season Selection */}
      <div className="glass-card rounded-xl p-6 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Selection */}
          <div>
            <label
              htmlFor="history-team-selector"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Select Team
            </label>
            <div className="relative">
              <select
                id="history-team-selector"
                name="historyTeam"
                value={historyTeam || ""}
                onChange={(e) =>
                  onHistoryTeamChange(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                className="w-full appearance-none pl-4 pr-10 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-secondary/80 transition-colors"
              >
                <option value="">Select a team...</option>
                <optgroup label="Eastern Conference">
                  {EASTERN_CONFERENCE.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Western Conference">
                  {WESTERN_CONFERENCE.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </optgroup>
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
            <p className="text-xs text-muted-foreground mt-2">
              Compare different eras (e.g., 2015-16 Warriors vs 2022-23
              Warriors)
            </p>
          </div>

          {/* Season Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Compare Seasons
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SEASONS.map((s) => (
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
          {/* Team Info */}
          <div className="glass-card rounded-xl p-6 bg-linear-to-r from-secondary/50 to-transparent">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <Image
                  src={getTeamLogo(String(historyData.team.id))}
                  alt={historyData.team.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {historyData.team.name}
                </h3>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <span className="bg-secondary px-2 py-0.5 rounded text-xs">
                    NBA
                  </span>
                  <span>•</span>
                  <span>Comparing {selectedSeasons.length} seasons</span>
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
                      Record
                    </th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                      Win%
                    </th>
                    <th className="text-center py-4 px-4 font-semibold uppercase tracking-wider text-xs text-foreground bg-primary/5">
                      PPG
                    </th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                      FG%
                    </th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                      3P%
                    </th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                      REB
                    </th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                      AST
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
                        {season.wins}-{season.losses}
                      </td>
                      <td className="text-center py-4 px-4 text-foreground font-medium">
                        {season.win_pct}%
                      </td>
                      <td className="text-center py-4 px-4 font-bold text-foreground bg-primary/5 text-base">
                        {season.ppg}
                      </td>
                      <td className="text-center py-4 px-4 text-foreground">
                        {season.fg_pct}%
                      </td>
                      <td className="text-center py-4 px-4 text-foreground">
                        {season.fg3_pct}%
                      </td>
                      <td className="text-center py-4 px-4 text-foreground">
                        {season.reb}
                      </td>
                      <td className="text-center py-4 px-4 text-foreground">
                        {season.ast}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Win Trend by Season */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">
                Win Trajectory by Season
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
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    {historyData.seasons.map((season, idx) => (
                      <Line
                        key={season.season}
                        type="monotone"
                        dataKey={`${season.season}_wins`}
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
                      cursor={{ fill: "var(--secondary)", opacity: 0.2 }}
                      contentStyle={CHART_TOOLTIP_STYLE}
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
            Select a team to analyze how their game has evolved over different
            seasons.
          </p>
        </div>
      )}
    </>
  );
}
