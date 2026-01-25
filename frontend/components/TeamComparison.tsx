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
      <div className="bg-card rounded-xl border border-border p-6">
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
              Compare Teams
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

      {/* Compare Teams Tab */}
      {activeTab === "compare" && (
        <>
          {/* Team Selection */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* Selected Teams */}
              {selectedTeams.map((teamId, idx) => {
                const teamName =
                  comparisonData?.teams.find((t) => t.team_id === teamId)
                    ?.name || getTeamNameById(teamId);
                return (
                  <div
                    key={teamId}
                    className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg"
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
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}

              {/* Add Team Button */}
              {selectedTeams.length < 5 && (
                <div className="relative">
                  <button
                    onClick={() => setShowTeamSelector(!showTeamSelector)}
                    className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/30 px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Team
                  </button>

                  {/* Team Selector Dropdown */}
                  {showTeamSelector && (
                    <div className="absolute top-full mt-2 left-0 w-72 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                      <div className="p-2 border-b border-border">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Eastern Conference
                        </p>
                      </div>
                      {EASTERN_CONFERENCE.filter(
                        (t) => !selectedTeams.includes(parseInt(t.id)),
                      ).map((team) => (
                        <button
                          key={team.id}
                          onClick={() => addTeam(parseInt(team.id))}
                          className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors flex items-center gap-3"
                        >
                          <div className="relative w-6 h-6">
                            <Image
                              src={getTeamLogo(team.id)}
                              alt={team.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-sm text-foreground">
                            {team.name}
                          </span>
                        </button>
                      ))}
                      <div className="p-2 border-b border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Western Conference
                        </p>
                      </div>
                      {WESTERN_CONFERENCE.filter(
                        (t) => !selectedTeams.includes(parseInt(t.id)),
                      ).map((team) => (
                        <button
                          key={team.id}
                          onClick={() => addTeam(parseInt(team.id))}
                          className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors flex items-center gap-3"
                        >
                          <div className="relative w-6 h-6">
                            <Image
                              src={getTeamLogo(team.id)}
                              alt={team.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-sm text-foreground">
                            {team.name}
                          </span>
                        </button>
                      ))}
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
          ) : comparisonData && comparisonData.teams.length > 0 ? (
            <>
              {/* Stats Comparison Table */}
              <div className="bg-card rounded-xl border border-border p-6 overflow-x-auto">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Team Statistics
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                        Team
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        Record
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        Win%
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        PPG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        FG%
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        3P%
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        REB
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        AST
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        STL
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        +/-
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.teams.map((team, idx) => (
                      <tr
                        key={team.team_id}
                        className="border-b border-border/50 hover:bg-secondary/50"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
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
                            <span className="font-medium text-foreground">
                              {team.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {team.wins}-{team.losses}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground font-medium">
                          {team.win_pct}%
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {team.ppg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {team.fg_pct}%
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {team.fg3_pct}%
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {team.reb}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {team.ast}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {team.stl}
                        </td>
                        <td
                          className={`text-center py-3 px-2 font-medium ${team.plus_minus >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {team.plus_minus >= 0 ? "+" : ""}
                          {team.plus_minus}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Win Trend Chart */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Win Trajectory
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
                        {comparisonData.teams.map((team, idx) => (
                          <Line
                            key={team.team_id}
                            type="monotone"
                            dataKey={`${team.name}_wins`}
                            name={team.name}
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
                    Team Identity
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
                        {comparisonData.teams.map((team, idx) => (
                          <Bar
                            key={team.team_id}
                            dataKey={team.name}
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
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select teams to compare their statistics
              </p>
            </div>
          )}
        </>
      )}

      {/* Season History Tab */}
      {activeTab === "history" && (
        <>
          {/* Team & Season Selection */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Team
                </label>
                <select
                  value={historyTeam || ""}
                  onChange={(e) =>
                    setHistoryTeam(
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
              {/* Team Info */}
              <div className="bg-card rounded-xl border border-border p-6">
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
                    <p className="text-muted-foreground text-sm">
                      Comparing {selectedSeasons.length} seasons
                    </p>
                  </div>
                </div>
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
                        Record
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        Win%
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        PPG
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        FG%
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        3P%
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        REB
                      </th>
                      <th className="text-center py-3 px-2 text-muted-foreground font-medium">
                        AST
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
                          {season.wins}-{season.losses}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground font-medium">
                          {season.win_pct}%
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.ppg}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.fg_pct}%
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.fg3_pct}%
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.reb}
                        </td>
                        <td className="text-center py-3 px-2 text-foreground">
                          {season.ast}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Win Trend by Season */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Win Trajectory by Season
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
                            dataKey={`${season.season}_wins`}
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
                Select a team to view their season history
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Compare legendary teams like the 2015-16 Warriors (73-9)
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
