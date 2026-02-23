"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Target,
  Calendar,
  RefreshCw,
  Star,
  Check,
} from "lucide-react";

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

interface TeamHeroProps {
  teamId: string;
  teamDetails: TeamDetails;
  isTracked: boolean;
  trackingInProgress: boolean;
  trackingLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  user: unknown;
  onTrackToggle: () => void;
  onRefresh: () => void;
}

export default function TeamHero({
  teamId,
  teamDetails,
  isTracked,
  trackingInProgress,
  trackingLoading,
  isRefreshing,
  lastUpdated,
  user,
  onTrackToggle,
  onRefresh,
}: TeamHeroProps) {
  return (
    <div className="relative bg-muted/30 border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="relative w-32 h-32 md:w-40 md:h-40 bg-card rounded-full p-6 border-2 border-border shadow-xl shrink-0 flex items-center justify-center overflow-hidden">
            <Image
              src={`https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`}
              alt={teamDetails.team_name}
              fill
              className="object-contain p-4"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                  {teamDetails.team_name}
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
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  2025-26 Season
                </span>
                <span className="flex items-center gap-1.5">
                  <Target className="h-4 w-4" />
                  Last 10:{" "}
                  <span className="text-foreground font-medium">
                    {teamDetails.last_10}
                  </span>
                </span>
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {lastUpdated
                    ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : "Refresh"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
              <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:border-primary/50 transition-colors">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Record
                </div>
                <div className="text-2xl font-bold">
                  {teamDetails.wins}-{teamDetails.losses}
                </div>
                <div
                  className={`text-xs font-medium ${teamDetails.win_pct * 100 >= 50 ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {(teamDetails.win_pct * 100).toFixed(1)}% Win Rate
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:border-primary/50 transition-colors">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Conf Rank
                </div>
                <div className="text-2xl font-bold">
                  #{teamDetails.conf_rank}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  Streak:{" "}
                  <span
                    className={
                      teamDetails.streak.startsWith("W")
                        ? "text-emerald-500 font-bold"
                        : "text-rose-500 font-bold"
                    }
                  >
                    {teamDetails.streak}
                  </span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:border-primary/50 transition-colors">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Scoring
                </div>
                <div className="text-2xl font-bold">
                  {teamDetails.ppg.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Points Per Game
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:border-primary/50 transition-colors">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Defense
                </div>
                <div className="text-2xl font-bold">
                  {teamDetails.opp_ppg.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Opp Points PG
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
