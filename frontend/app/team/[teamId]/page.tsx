"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import { getTeam } from "@/lib/api/client";
import { useTracking } from "@/lib/hooks/useTracking";
import TeamHero from "@/components/team-detail/TeamHero";
import TeamCharts from "@/components/team-detail/TeamCharts";
import TeamGameLog from "@/components/team-detail/TeamGameLog";

interface TeamDetails {
  team_id: string;
  team_name: string;
  wins: number;
  losses: number;
  win_pct: number;
  conf_rank: number;
  ppg: number;
  opp_ppg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  reb: number;
  ast: number;
  plus_minus: number;
  last_10: string;
  streak: string;
  home_record: string;
  away_record: string;
}

interface GameLog {
  date: string;
  opponent: string;
  location?: string;
  matchup?: string;
  result: string;
  pts: number;
  opp_pts: number;
  fg_pct: number;
  fg3_pct?: number;
  reb?: number;
  ast?: number;
}

export default function TeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [gameLogs, setGameLogs] = useState<GameLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    user,
    isTeamTracked,
    trackTeam,
    untrackTeam,
    loading: trackingLoading,
  } = useTracking();
  const [trackingInProgress, setTrackingInProgress] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  const fetchTeamData = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getTeam(teamId);

      setTeamDetails(data.team);
      setGameLogs(data.recent_games || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching team data:", err);
      setError("Failed to load team data. Checking backend service...");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleTrackToggle = async () => {
    if (!teamDetails || trackingInProgress) return;

    setTrackingInProgress(true);
    try {
      const numericTeamId = parseInt(teamId);
      if (isTeamTracked(numericTeamId)) {
        await untrackTeam(numericTeamId);
      } else {
        const abbr =
          teamDetails.team_name
            .split(" ")
            .pop()
            ?.substring(0, 3)
            .toUpperCase() || "NBA";
        await trackTeam(numericTeamId, teamDetails.team_name, abbr);
      }
    } finally {
      setTrackingInProgress(false);
    }
  };

  const isTracked = teamDetails ? isTeamTracked(parseInt(teamId)) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">
            Analyzing Season Performance...
          </p>
        </div>
      </div>
    );
  }

  if (error || !teamDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card text-card-foreground p-8 rounded-xl border border-border max-w-md w-full text-center shadow-lg">
          <div className="bg-destructive/10 text-destructive p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Data Unavailable</h2>
          <p className="text-muted-foreground mb-6">
            {error || "Team not found"}
          </p>
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 text-primary hover:underline justify-center font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Team List
          </Link>
        </div>
      </div>
    );
  }

  const last10Games = gameLogs.slice(0, 10);
  const performanceData = [...last10Games].reverse().map((game, idx) => ({
    game: `G${idx + 1}`,
    points: game.pts,
    opponent_points: game.opp_pts,
    fg_pct: game.fg_pct * 100,
    margin: game.pts - game.opp_pts,
  }));

  const statsRadarData = [
    { stat: "Scoring", value: (teamDetails.ppg / 130) * 100, fullMark: 100 },
    {
      stat: "Defense",
      value: (1 - (teamDetails.opp_ppg - 90) / 50) * 100,
      fullMark: 100,
    },
    { stat: "Win %", value: teamDetails.win_pct * 100, fullMark: 100 },
    { stat: "3PT %", value: (teamDetails.fg3_pct / 0.45) * 100, fullMark: 100 },
    { stat: "Rebounds", value: (teamDetails.reb / 60) * 100, fullMark: 100 },
    {
      stat: "Streak",
      value: Math.min(
        teamDetails.streak.startsWith("W")
          ? parseInt(teamDetails.streak.substring(1)) * 10
          : 10,
        100,
      ),
      fullMark: 100,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <TeamHero
        teamId={teamId}
        teamDetails={teamDetails}
        isTracked={isTracked}
        trackingInProgress={trackingInProgress}
        trackingLoading={trackingLoading}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        user={user}
        onTrackToggle={handleTrackToggle}
        onRefresh={() => fetchTeamData(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <TeamCharts
          teamName={teamDetails.team_name}
          performanceData={performanceData}
          radarData={statsRadarData}
        />
        <TeamGameLog gameLogs={gameLogs} />
      </div>
    </div>
  );
}
