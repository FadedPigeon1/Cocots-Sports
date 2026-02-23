"use client";

import { Trophy, TrendingUp, Activity, Target } from "lucide-react";

interface TeamStats {
  record: string;
  conferenceRank: string;
  streak: string;
  lastLoss: string;
  offRating: string;
  offRatingRank: string;
  netRating: string;
  netRatingRank: string;
}

interface TrackerStatsProps {
  stats: TeamStats;
}

export default function TrackerStats({ stats }: TrackerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gray-900/50 p-6 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-400 text-sm">Season Record</p>
          <Trophy className="text-neon-green h-5 w-5" />
        </div>
        <p className="text-3xl font-bold text-white">{stats.record}</p>
        <p className="text-neon-green text-xs mt-1">{stats.conferenceRank}</p>
      </div>

      <div className="bg-gray-900/50 p-6 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-400 text-sm">Win Streak</p>
          <TrendingUp className="text-blue-500 h-5 w-5" />
        </div>
        <p className="text-3xl font-bold text-white">{stats.streak}</p>
        <p className="text-gray-500 text-xs mt-1">
          Last Loss: {stats.lastLoss}
        </p>
      </div>

      <div className="bg-gray-900/50 p-6 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-400 text-sm">Offensive Rating</p>
          <Target className="text-orange-500 h-5 w-5" />
        </div>
        <p className="text-3xl font-bold text-white">{stats.offRating}</p>
        <p className="text-neon-green text-xs mt-1">{stats.offRatingRank}</p>
      </div>

      <div className="bg-gray-900/50 p-6 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-400 text-sm">Net Rating</p>
          <Activity className="text-purple-500 h-5 w-5" />
        </div>
        <p className="text-3xl font-bold text-white">{stats.netRating}</p>
        <p className="text-neon-green text-xs mt-1">{stats.netRatingRank}</p>
      </div>
    </div>
  );
}
