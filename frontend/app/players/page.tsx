"use client";

import Link from "next/link";
import { ArrowLeft, Search, User, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const players = [
    {
      name: "Luka Dončić",
      team: "LAL",
      ppg: 35.3,
      rpg: 8.9,
      apg: 8.9,
      position: "G",
    },
    {
      name: "Shai Gilgeous-Alexander",
      team: "OKC",
      ppg: 32.8,
      rpg: 4.7,
      apg: 6.5,
      position: "G",
    },
    {
      name: "Tyrese Maxey",
      team: "PHI",
      ppg: 32.5,
      rpg: 4.8,
      apg: 7.5,
      position: "G",
    },
    {
      name: "Giannis Antetokounmpo",
      team: "MIL",
      ppg: 30.6,
      rpg: 10.7,
      apg: 6.4,
      position: "F",
    },
    {
      name: "Donovan Mitchell",
      team: "CLE",
      ppg: 30.6,
      rpg: 5.0,
      apg: 5.5,
      position: "G",
    },
    {
      name: "Nikola Jokić",
      team: "DEN",
      ppg: 29.6,
      rpg: 12.7,
      apg: 10.2,
      position: "C",
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
              <Link
                href="/teams"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
                Teams
              </Link>
              <Link href="/players" className="text-neon-green font-semibold">
                Players
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">NBA Players</h1>
          <p className="text-gray-400 text-lg">
            Search for players and view their statistics and performance
            predictions.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search for a player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green transition-colors"
            />
          </div>
        </div>

        {/* Players Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-neon-green/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Player
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Team
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    Position
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">
                    PPG
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">
                    RPG
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">
                    APG
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {players.map((player) => (
                  <tr
                    key={player.name}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-neon-green/20 flex items-center justify-center border border-neon-green/50">
                          <User className="h-5 w-5 text-neon-green" />
                        </div>
                        <span className="text-white font-medium">
                          {player.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{player.team}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {player.position}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-semibold">
                      {player.ppg}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-semibold">
                      {player.rpg}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-semibold">
                      {player.apg}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-neon-green hover:text-green-400 flex items-center gap-1 ml-auto transition-colors">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Predict</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
