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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Plus, X, Users } from "lucide-react";
import {
  EASTERN_CONFERENCE,
  WESTERN_CONFERENCE,
  CHART_COLORS,
  getTeamLogo,
  CHART_TOOLTIP_STYLE,
} from "@/lib/constants/nba-teams";
import type { TeamData, ComparisonData } from "@/lib/types/team";

interface TeamCompareTabProps {
  selectedTeams: number[];
  comparisonData: {
    teams: TeamData[];
    comparison_data: ComparisonData[];
  } | null;
  loading: boolean;
  season: string;
  availableSeasons: string[];
  showTeamSelector: boolean;
  onAddTeam: (teamId: number) => void;
  onRemoveTeam: (teamId: number) => void;
  onToggleSelector: () => void;
  onSeasonChange: (season: string) => void;
  getTeamNameById: (teamId: number) => string;
}

function prepareGameChartData(
  comparisonData: TeamCompareTabProps["comparisonData"],
) {
  if (!comparisonData || comparisonData.teams.length === 0) return [];

  const maxGames = Math.max(
    ...comparisonData.teams.map((t) => t.game_data?.length || 0),
  );
  const chartData = [];

  for (let i = 0; i < maxGames; i++) {
    const dataPoint: Record<string, number> = { game_num: i + 1 };
    comparisonData.teams.forEach((team) => {
      if (team.game_data && team.game_data[i]) {
        dataPoint[`${team.name}_wins`] = team.game_data[i].wins;
      }
    });
    chartData.push(dataPoint);
  }

  return chartData;
}

export default function TeamCompareTab({
  selectedTeams,
  comparisonData,
  loading,
  season,
  availableSeasons,
  showTeamSelector,
  onAddTeam,
  onRemoveTeam,
  onToggleSelector,
  onSeasonChange,
  getTeamNameById,
}: TeamCompareTabProps) {
  return (
    <>
      {/* Team Selection */}
      <div className="glass-card rounded-xl p-6 relative z-20">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="flex flex-wrap items-center gap-3 w-full">
            {/* Selected Teams */}
            {selectedTeams.map((teamId, idx) => {
              const teamName =
                comparisonData?.teams.find((t) => t.team_id === teamId)?.name ||
                getTeamNameById(teamId);
              return (
                <div
                  key={teamId}
                  className="flex items-center gap-2 bg-secondary/80 border border-border px-3 py-2 rounded-lg shadow-sm animate-in fade-in zoom-in duration-200"
                  style={{ borderLeft: `3px solid ${CHART_COLORS[idx]}` }}
                >
                  <div className="relative w-6 h-6">
                    <Image
                      src={getTeamLogo(String(teamId))}
                      alt={teamName}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {teamName}
                  </span>
                  <button
                    onClick={() => onRemoveTeam(teamId)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-1 p-0.5 rounded-full hover:bg-destructive/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Add Team Button */}
            {selectedTeams.length < 5 && (
              <div className="relative">
                <button
                  onClick={onToggleSelector}
                  className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/20 transition-all duration-200 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Team
                </button>

                {/* Team Selector Dropdown */}
                {showTeamSelector && (
                  <div className="absolute top-full mt-2 left-0 w-72 bg-popover border border-border rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <div className="p-2 border-b border-border bg-secondary/30 sticky top-0 backdrop-blur-sm z-10">
                      <p className="text-xs font-bold text-muted-foreground uppercase px-2">
                        Eastern Conference
                      </p>
                    </div>
                    {EASTERN_CONFERENCE.filter(
                      (t) => !selectedTeams.includes(parseInt(t.id)),
                    ).map((team) => (
                      <button
                        key={team.id}
                        onClick={() => onAddTeam(parseInt(team.id))}
                        className="w-full px-4 py-3 text-left hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-3 border-b border-border/40 last:border-0"
                      >
                        <div className="relative w-6 h-6">
                          <Image
                            src={getTeamLogo(team.id)}
                            alt={team.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium">{team.name}</span>
                      </button>
                    ))}
                    <div className="p-2 border-b border-t border-border bg-secondary/30 sticky top-0 backdrop-blur-sm z-10">
                      <p className="text-xs font-bold text-muted-foreground uppercase px-2">
                        Western Conference
                      </p>
                    </div>
                    {WESTERN_CONFERENCE.filter(
                      (t) => !selectedTeams.includes(parseInt(t.id)),
                    ).map((team) => (
                      <button
                        key={team.id}
                        onClick={() => onAddTeam(parseInt(team.id))}
                        className="w-full px-4 py-3 text-left hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-3 border-b border-border/40 last:border-0"
                      >
                        <div className="relative w-6 h-6">
                          <Image
                            src={getTeamLogo(team.id)}
                            alt={team.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium">{team.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Season Selector */}
          <div className="min-w-[140px]">
            <label htmlFor="season-selector" className="sr-only">
              Select Season
            </label>
            <div className="relative">
              <select
                id="season-selector"
                name="season"
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
              <Users className="h-6 w-6 text-primary/40" />
            </div>
          </div>
          <p className="text-muted-foreground mt-6 font-medium">
            Crunching the numbers...
          </p>
        </div>
      ) : comparisonData && comparisonData.teams.length > 0 ? (
        <>
          {/* Stats Comparison Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">
                Team Statistics
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/30">
                    <th className="text-left py-4 px-6 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                      Team
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
                    <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                      STL
                    </th>
                    <th className="text-center py-4 px-4 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                      +/-
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparisonData.teams.map((team, idx) => (
                    <tr
                      key={team.team_id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2 h-8 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[idx] }}
                          />
                          <div className="relative w-6 h-6">
                            <Image
                              src={getTeamLogo(String(team.team_id))}
                              alt={team.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="font-semibold text-foreground">
                            {team.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4 text-foreground font-medium">
                        {team.wins}-{team.losses}
                      </td>
                      <td className="text-center py-4 px-4 text-muted-foreground">
                        {team.win_pct}%
                      </td>
                      <td className="text-center py-4 px-4 font-bold text-foreground bg-primary/5 text-base">
                        {team.ppg}
                      </td>
                      <td className="text-center py-4 px-4 text-foreground">
                        {team.fg_pct}%
                      </td>
                      <td className="text-center py-4 px-4 text-foreground">
                        {team.fg3_pct}%
                      </td>
                      <td className="text-center py-4 px-4 text-foreground">
                        {team.reb}
                      </td>
                      <td className="text-center py-4 px-4 text-foreground">
                        {team.ast}
                      </td>
                      <td className="text-center py-4 px-4 text-foreground">
                        {team.stl}
                      </td>
                      <td
                        className={`text-center py-4 px-4 font-bold ${team.plus_minus >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {team.plus_minus >= 0 ? "+" : ""}
                        {team.plus_minus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Win Trend Chart */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">
                Win Trajectory
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
                    />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    {comparisonData.teams.map((team, idx) => (
                      <Line
                        key={team.team_id}
                        type="monotone"
                        dataKey={`${team.name}_wins`}
                        name={team.name}
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
                Team Identity
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
                    {comparisonData.teams.map((team, idx) => (
                      <Radar
                        key={team.team_id}
                        name={team.name}
                        dataKey={team.name}
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
                      contentStyle={CHART_TOOLTIP_STYLE}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    {comparisonData.teams.map((team, idx) => (
                      <Bar
                        key={team.team_id}
                        dataKey={team.name}
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
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Start Comparing
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Select up to 5 teams to compare their stats, performance trends, and
            efficiency metrics head-to-head.
          </p>
          <button
            onClick={onToggleSelector}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 font-medium"
          >
            Select First Team
          </button>
        </div>
      )}
    </>
  );
}
