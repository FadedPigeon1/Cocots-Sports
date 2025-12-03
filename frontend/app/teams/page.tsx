"use client";

import Link from "next/link";
import { ArrowLeft, Trophy, TrendingUp, Users } from "lucide-react";

export default function TeamsPage() {
  const teams = [
    {
      name: "Oklahoma City Thunder",
      abbr: "OKC",
      wins: 21,
      losses: 1,
      winPct: 0.955,
      conference: "West",
    },
    {
      name: "Detroit Pistons",
      abbr: "DET",
      wins: 17,
      losses: 4,
      winPct: 0.81,
      conference: "East",
    },
    {
      name: "Los Angeles Lakers",
      abbr: "LAL",
      wins: 15,
      losses: 5,
      winPct: 0.75,
      conference: "West",
    },
    {
      name: "Houston Rockets",
      abbr: "HOU",
      wins: 13,
      losses: 5,
      winPct: 0.722,
      conference: "West",
    },
    {
      name: "San Antonio Spurs",
      abbr: "SAS",
      wins: 14,
      losses: 6,
      winPct: 0.7,
      conference: "West",
    },
    {
      name: "Denver Nuggets",
      abbr: "DEN",
      wins: 14,
      losses: 6,
      winPct: 0.7,
      conference: "West",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-neon-green/20 backdrop-blur-sm bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-white hover:text-neon-green transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex gap-6">
              <Link
                href="/predictions"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
                Predictions
              </Link>
              <Link href="/teams" className="text-neon-green font-semibold">
                Teams
              </Link>
              <Link
                href="/players"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
                Players
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">NBA Teams</h1>
          <p className="text-gray-400 text-lg">
            Browse team statistics, standings, and performance metrics.
          </p>
        </div>

        {/* Conference Tabs */}
        <div className="flex gap-4 mb-8">
          <button className="bg-neon-green text-black px-6 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors">
            All Teams
          </button>
          <button className="bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors border border-white/10">
            Eastern Conference
          </button>
          <button className="bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors border border-white/10">
            Western Conference
          </button>
        </div>

        {/* Teams Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.abbr}
              className="bg-gray-900/50 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-neon-green transition-colors">
                    {team.name}
                  </h3>
                  <p className="text-gray-400">
                    {team.abbr} • {team.conference}
                  </p>
                </div>
                <Trophy className="h-6 w-6 text-neon-green" />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Wins</p>
                  <p className="text-2xl font-bold text-white">{team.wins}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Losses</p>
                  <p className="text-2xl font-bold text-white">{team.losses}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Win %</p>
                  <p className="text-2xl font-bold text-neon-green">
                    {(team.winPct * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-gray-400 text-sm flex items-center gap-2 group-hover:text-white transition-colors">
                  <TrendingUp className="h-4 w-4" />
                  View Stats
                </span>
                <span className="text-gray-400 text-sm flex items-center gap-2 group-hover:text-white transition-colors">
                  <Users className="h-4 w-4" />
                  Roster
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
