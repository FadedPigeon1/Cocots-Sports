"use client";

import { useState, useEffect } from "react";
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
import { Plus, X, TrendingUp, History, Users } from "lucide-react";
import { compareTeams, getTeamHistory } from "@/lib/api/client";

// NBA Teams Data
const EASTERN_CONFERENCE = [
  { name: "Atlanta Hawks", id: "1610612737", abbr: "ATL" },
  { name: "Boston Celtics", id: "1610612738", abbr: "BOS" },
  { name: "Brooklyn Nets", id: "1610612751", abbr: "BKN" },
  { name: "Charlotte Hornets", id: "1610612766", abbr: "CHA" },
  { name: "Chicago Bulls", id: "1610612741", abbr: "CHI" },
  { name: "Cleveland Cavaliers", id: "1610612739", abbr: "CLE" },
  { name: "Detroit Pistons", id: "1610612765", abbr: "DET" },
  { name: "Indiana Pacers", id: "1610612754", abbr: "IND" },
  { name: "Miami Heat", id: "1610612748", abbr: "MIA" },
  { name: "Milwaukee Bucks", id: "1610612749", abbr: "MIL" },
  { name: "New York Knicks", id: "1610612752", abbr: "NYK" },
  { name: "Orlando Magic", id: "1610612753", abbr: "ORL" },
  { name: "Philadelphia 76ers", id: "1610612755", abbr: "PHI" },
  { name: "Toronto Raptors", id: "1610612761", abbr: "TOR" },
  { name: "Washington Wizards", id: "1610612764", abbr: "WAS" },
];

const WESTERN_CONFERENCE = [
  { name: "Dallas Mavericks", id: "1610612742", abbr: "DAL" },
  { name: "Denver Nuggets", id: "1610612743", abbr: "DEN" },
  { name: "Golden State Warriors", id: "1610612744", abbr: "GSW" },
  { name: "Houston Rockets", id: "1610612745", abbr: "HOU" },
  { name: "LA Clippers", id: "1610612746", abbr: "LAC" },
  { name: "LA Lakers", id: "1610612747", abbr: "LAL" },
  { name: "Memphis Grizzlies", id: "1610612763", abbr: "MEM" },
  { name: "Minnesota Timberwolves", id: "1610612750", abbr: "MIN" },
  { name: "New Orleans Pelicans", id: "1610612740", abbr: "NOP" },
  { name: "Oklahoma City Thunder", id: "1610612760", abbr: "OKC" },
  { name: "Phoenix Suns", id: "1610612756", abbr: "PHX" },
  { name: "Portland Trail Blazers", id: "1610612757", abbr: "POR" },
  { name: "Sacramento Kings", id: "1610612758", abbr: "SAC" },
  { name: "San Antonio Spurs", id: "1610612759", abbr: "SAS" },
  { name: "Utah Jazz", id: "1610612762", abbr: "UTA" },
];

const ALL_TEAMS = [...EASTERN_CONFERENCE, ...WESTERN_CONFERENCE];

// Colors for different teams/seasons in charts
const CHART_COLORS = ["#39FF14", "#3b82f6", "#f97316", "#ef4444", "#8b5cf6"];

// Helper to get logo URL
const getTeamLogo = (teamId: string) => {
  return `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`;
};

interface TeamData {
  team_id: number;
  name: string;
  season: string;
  wins: number;
  losses: number;
  win_pct: number;
  ppg: number;
  opp_ppg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  plus_minus: number;
  game_data: {
    game_num: number;
    wins: number;
    losses: number;
    pts: number;
    date: string;
  }[];
}

interface SeasonData {
  season: string;
  wins: number;
  losses: number;
  win_pct: number;
  ppg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  game_data: { game_num: number; wins: number; pts: number }[];
}

interface ComparisonData {
  stat: string;
  [key: string]: string | number;
}

export default function TeamComparison() {
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<{
    teams: TeamData[];
    comparison_data: ComparisonData[];
  } | null>(null);
  const [historyData, setHistoryData] = useState<{
    team: { id: number; name: string; abbreviation: string };
    seasons: SeasonData[];
    comparison_data: ComparisonData[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<"compare" | "history">("compare");
  const [historyTeam, setHistoryTeam] = useState<number | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([
    "2023-24",
    "2024-25",
    "2025-26",
  ]);
  const [season, setSeason] = useState("2025-26");

  // Available seasons for history comparison (including historic ones like 2015-16 Warriors)
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

  // Fetch comparison data when teams change
  useEffect(() => {
    const fetchComparison = async () => {
      if (selectedTeams.length < 1) {
        setComparisonData(null);
        return;
      }

      setLoading(true);
      try {
        const data = await compareTeams(selectedTeams, season);
        setComparisonData(data);
      } catch (error) {
        console.error("Failed to fetch team comparison:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "compare") {
      fetchComparison();
    }
  }, [selectedTeams, season, activeTab]);

  // Fetch history data when history team changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!historyTeam) {
        setHistoryData(null);
        return;
      }

      setLoading(true);
      try {
        const data = await getTeamHistory(historyTeam, selectedSeasons);
        setHistoryData(data);
      } catch (error) {
        console.error("Failed to fetch team history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "history") {
      fetchHistory();
    }
  }, [historyTeam, selectedSeasons, activeTab]);

  const addTeam = (teamId: number) => {
    if (selectedTeams.length < 5 && !selectedTeams.includes(teamId)) {
      setSelectedTeams([...selectedTeams, teamId]);
    }
    setShowTeamSelector(false);
  };

  const removeTeam = (teamId: number) => {
    setSelectedTeams(selectedTeams.filter((id) => id !== teamId));
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

  const getTeamNameById = (teamId: number) => {
    const team = ALL_TEAMS.find((t) => t.id === String(teamId));
    return team?.name || "Unknown Team";
  };

  // Prepare game-by-game chart data for comparison
  const prepareGameChartData = () => {
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
          dataPoint[`${season.season}_wins`] = season.game_data[i].wins;
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
              <Users className="h-6 w-6 text-primary" />
              Team Comparison
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Compare teams head-to-head or track a team across different
              seasons
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
              Compare Teams
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

      {/* Compare Teams Tab */}
      {activeTab === "compare" && (
        <>
          {/* Team Selection */}
          <div className="glass-card rounded-xl p-6 relative z-20">
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
              <div className="flex flex-wrap items-center gap-3 w-full">
                {/* Selected Teams */}
                {selectedTeams.map((teamId, idx) => {
                  const teamName =
                    comparisonData?.teams.find((t) => t.team_id === teamId)
                      ?.name || getTeamNameById(teamId);
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
                        onClick={() => removeTeam(teamId)}
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
                      onClick={() => setShowTeamSelector(!showTeamSelector)}
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
                            onClick={() => addTeam(parseInt(team.id))}
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
                            <span className="text-sm font-medium">
                              {team.name}
                            </span>
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
                            onClick={() => addTeam(parseInt(team.id))}
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
                            <span className="text-sm font-medium">
                              {team.name}
                            </span>
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
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            color: "var(--foreground)",
                          }}
                        />
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
                            color: "var(--foreground)",
                          }}
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
                Select up to 5 teams to compare their stats, performance trends,
                and efficiency metrics head-to-head.
              </p>
              <button
                onClick={() => setShowTeamSelector(true)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 font-medium"
              >
                Select First Team
              </button>
            </div>
          )}
        </>
      )}

      {/* Season History Tab */}
      {activeTab === "history" && (
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
                      setHistoryTeam(
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
                  {availableSeasons.map((s) => (
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
                            color: "var(--foreground)",
                          }}
                        />
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
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            color: "var(--foreground)",
                          }}
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
                Select a team to analyze how their game has evolved over
                different seasons.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
