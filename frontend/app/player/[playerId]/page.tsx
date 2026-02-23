"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { getPlayer } from "@/lib/api/client";
import { useTracking } from "@/lib/hooks/useTracking";
import PlayerHero from "@/components/player-detail/PlayerHero";
import PlayerPerformanceChart from "@/components/player-detail/PlayerPerformanceChart";
import PlayerSidebar from "@/components/player-detail/PlayerSidebar";
import PlayerGameLog from "@/components/player-detail/PlayerGameLog";

interface PlayerDetails {
  info: {
    id: number;
    name: string;
    team: string;
    team_id: number;
    position: string;
    height: string;
    weight: string;
    jersey: string;
    country: string;
    draft_year: string;
    experience: number;
  };
  stats: {
    ppg: number;
    rpg: number;
    apg: number;
    spg: number;
    bpg: number;
    fg_pct: number;
    fg3_pct: number;
    ft_pct: number;
    games_played: number;
  };
  recent_games: {
    game_id: string;
    date: string;
    matchup: string;
    wl: string;
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    fg_pct: number;
    fg3_pct: number;
    ft_pct: number;
    min: string;
  }[];
}

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.playerId as string;

  const [player, setPlayer] = useState<PlayerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    user,
    isPlayerTracked,
    trackPlayer,
    untrackPlayer,
    loading: trackingLoading,
  } = useTracking();
  const [trackingInProgress, setTrackingInProgress] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getPlayer(playerId);
        setPlayer(data);
      } catch (err) {
        console.error("Error fetching player:", err);
        setError("Failed to load player data");
      } finally {
        setLoading(false);
      }
    }
    if (playerId) {
      fetchData();
    }
  }, [playerId]);

  const handleTrackToggle = async () => {
    if (!player || trackingInProgress) return;

    setTrackingInProgress(true);
    try {
      const numericPlayerId = parseInt(playerId);
      if (isPlayerTracked(numericPlayerId)) {
        await untrackPlayer(numericPlayerId);
      } else {
        const teamAbbr =
          player.info.team.split(" ").pop()?.substring(0, 3).toUpperCase() ||
          "NBA";
        await trackPlayer(numericPlayerId, player.info.name, teamAbbr);
      }
    } finally {
      setTrackingInProgress(false);
    }
  };

  const isTracked = player ? isPlayerTracked(parseInt(playerId)) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">
            Loading Player Stats...
          </p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card text-card-foreground p-8 rounded-xl border border-border max-w-md w-full text-center shadow-lg">
          <div className="bg-destructive/10 text-destructive p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Player Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || "Could not retrieve player details"}
          </p>
          <Link
            href="/players"
            className="inline-flex items-center gap-2 text-primary hover:underline justify-center font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Players
          </Link>
        </div>
      </div>
    );
  }

  const chartData = [...player.recent_games].reverse().map((game, idx) => ({
    game: `G${idx + 1}`,
    pts: game.pts,
    reb: game.reb,
    ast: game.ast,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <PlayerHero
        playerInfo={player.info}
        playerStats={player.stats}
        isTracked={isTracked}
        trackingInProgress={trackingInProgress}
        trackingLoading={trackingLoading}
        user={user}
        onTrackToggle={handleTrackToggle}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <PlayerPerformanceChart chartData={chartData} />
          <PlayerSidebar
            stats={player.stats}
            recentGames={player.recent_games}
          />
        </div>
        <PlayerGameLog recentGames={player.recent_games} />
      </div>
    </div>
  );
}
