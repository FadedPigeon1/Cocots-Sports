"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Ruler,
  Weight,
  Flag,
  Star,
  Check,
  RefreshCw,
  User,
} from "lucide-react";

interface PlayerInfo {
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
}

interface PlayerStats {
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  games_played: number;
}

interface PlayerHeroProps {
  playerInfo: PlayerInfo;
  playerStats: PlayerStats;
  isTracked: boolean;
  trackingInProgress: boolean;
  trackingLoading: boolean;
  user: unknown;
  onTrackToggle: () => void;
}

export default function PlayerHero({
  playerInfo,
  playerStats,
  isTracked,
  trackingInProgress,
  trackingLoading,
  user,
  onTrackToggle,
}: PlayerHeroProps) {
  return (
    <div className="relative bg-muted/30 border-b border-border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <Link
          href="/players"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Players
        </Link>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
          {/* Player Headshot */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 -mb-8 z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-0 opacity-20 rounded-full md:rounded-none" />
            <Image
              src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${playerInfo.id}.png`}
              alt={playerInfo.name}
              fill
              className="object-contain drop-shadow-xl"
              priority
            />
          </div>

          <div className="flex-1 space-y-6 pb-8 text-center md:text-left">
            <div>
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                  {playerInfo.name}
                </h1>
                {!!user && (
                  <button
                    onClick={onTrackToggle}
                    disabled={trackingInProgress || trackingLoading}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isTracked
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
                    } disabled:opacity-50`}
                  >
                    {trackingInProgress ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : isTracked ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                    {isTracked ? "Tracking" : "Track"}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-lg text-muted-foreground">
                <span className="font-semibold text-primary">
                  #{playerInfo.jersey}
                </span>
                <span>•</span>
                <span>{playerInfo.position}</span>
                <span>•</span>
                <Link
                  href={`/team/${playerInfo.team_id}`}
                  className="hover:text-primary transition-colors hover:underline"
                >
                  {playerInfo.team}
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                {playerInfo.height}
              </div>
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4" />
                {playerInfo.weight} lbs
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                {playerInfo.country}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {playerInfo.experience} Yrs Exp
              </div>
            </div>
          </div>

          {/* Quick Season Stats */}
          <div className="grid grid-cols-3 gap-4 pb-8 w-full md:w-auto">
            <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm min-w-[100px]">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                PTS
              </div>
              <div className="text-3xl font-bold flex flex-col">
                {playerStats.ppg.toFixed(1)}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm min-w-[100px]">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                REB
              </div>
              <div className="text-3xl font-bold">
                {playerStats.rpg.toFixed(1)}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm min-w-[100px]">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                AST
              </div>
              <div className="text-3xl font-bold">
                {playerStats.apg.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
