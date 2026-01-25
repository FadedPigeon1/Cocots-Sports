"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { Star, TrendingUp, Users, ExternalLink } from "lucide-react";
import { useTracking, TrackedTeam } from "@/lib/hooks/useTracking";
import { compareTeams } from "@/lib/api/client";

// Colors for different teams in charts
const CHART_COLORS = ["#39FF14", "#3b82f6", "#f97316", "#ef4444", "#8b5cf6"];

// Helper to get logo URL
const getTeamLogo = (teamId: string) => {
  return `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`;
};

interface TeamData {
  team_id: number;
  name: string;
  wins: number;
  losses: number;
  win_pct: number;
  ppg: number;
  game_data: {
    game_num: number;
    wins: number;
    losses: number;
    pts: number;
  }[];
}

interface ComparisonData {
  teams: TeamData[];
  comparison_data: { stat: string; [key: string]: string | number }[];
}

export default function TrackedTeamsChart() {
  const { trackedTeams, loading: trackingLoading, user } = useTracking();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (trackedTeams.length === 0) {
        setComparisonData(null);
        return;
      }

      setLoading(true);
      try {
        const teamIds = trackedTeams.slice(0, 5).map((t) => t.team_id);
        const data = await compareTeams(teamIds, "2025-26");
        setComparisonData(data);
      } catch (error) {
        console.error("Failed to fetch tracked teams data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!trackingLoading && trackedTeams.length > 0) {
      fetchData();
    }
  }, [trackedTeams, trackingLoading]);

  // Prepare game-by-game chart data
  const prepareChartData = () => {
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

  if (!user) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="bg-secondary/20 p-4 rounded-full w-fit mx-auto mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Sign in to Track Teams
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create an account to track your favorite teams and see their
          performance here.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (trackingLoading || loading) {
    return (
      <div className="glass-card rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Star className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">
            Your Tracked Teams
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground mt-4">Loading your teams...</p>
        </div>
      </div>
    );
  }

  if (trackedTeams.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Star className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">
            Your Tracked Teams
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="bg-secondary/20 p-4 rounded-full w-fit mx-auto mb-4">
            <Star className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="text-foreground font-medium mb-2">
            No Teams Tracked Yet
          </h4>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Start tracking teams to see their win progression and stats
            comparison here.
          </p>
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Browse Teams
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Your Tracked Teams
            </h3>
            <p className="text-sm text-muted-foreground">
              Season win progression for {trackedTeams.length} team
              {trackedTeams.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Link
          href="/teams"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Manage
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Team Pills */}
      <div className="px-6 py-4 border-b border-border bg-secondary/20">
        <div className="flex flex-wrap gap-2">
          {comparisonData?.teams.map((team, idx) => (
            <Link
              key={team.team_id}
              href={`/team/${team.team_id}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary/80 border border-border rounded-full hover:bg-secondary transition-colors group"
              style={{
                borderLeftColor: CHART_COLORS[idx],
                borderLeftWidth: "3px",
              }}
            >
              <div className="relative w-5 h-5">
                <Image
                  src={getTeamLogo(String(team.team_id))}
                  alt={team.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                {team.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {team.wins}-{team.losses}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={prepareChartData()}
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
                label={{
                  value: "Games Played",
                  position: "insideBottom",
                  offset: -5,
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Wins",
                  angle: -90,
                  position: "insideLeft",
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
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
              {comparisonData?.teams.map((team, idx) => (
                <Line
                  key={team.team_id}
                  type="monotone"
                  dataKey={`${team.name}_wins`}
                  name={team.name}
                  stroke={CHART_COLORS[idx]}
                  strokeWidth={3}
                  dot={{ r: 3, strokeWidth: 0, fill: CHART_COLORS[idx] }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Summary */}
      {comparisonData && comparisonData.teams.length > 0 && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comparisonData.teams.slice(0, 4).map((team, idx) => (
              <div
                key={team.team_id}
                className="bg-secondary/30 rounded-lg p-4 border-l-2"
                style={{ borderLeftColor: CHART_COLORS[idx] }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-6 h-6">
                    <Image
                      src={getTeamLogo(String(team.team_id))}
                      alt={team.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {team.name}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {team.wins}-{team.losses}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {team.win_pct}% Win Rate
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
