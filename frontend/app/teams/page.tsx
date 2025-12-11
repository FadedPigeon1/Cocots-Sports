"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Team {
  name: string;
  id: string;
  score: number;
}

interface Game {
  date: string;
  home_team: Team;
  away_team: Team;
  status: string;
}

export default function RecentGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentGames();
  }, []);

  const fetchRecentGames = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/v1/games/recent?days_back=3"
      );
      const data = await response.json();
      setGames(data.games || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching games:", err);
      setError("Failed to load recent games. Showing mock data.");
      // Fallback to mock data
      setGames([
        {
          date: "Dec 8, 2025",
          home_team: { name: "Detroit Pistons", id: "1610612765", score: 105 },
          away_team: { name: "Indiana Pacers", id: "1610612754", score: 96 },
          status: "Final",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTeamLogo = (teamId: string) => {
    return `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`;
  };

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
                Recent Games
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
          <h1 className="text-4xl font-bold text-white mb-4">Recent Games</h1>
          <p className="text-gray-400 text-lg">
            Latest scores and results from around the league.
          </p>
          {error && <p className="text-yellow-500 text-sm mt-2">{error}</p>}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 text-neon-green animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6">
            {games.map((game, index) => (
              <div
                key={index}
                className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{game.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neon-green text-sm font-semibold">
                    <Clock className="h-4 w-4" />
                    <span>{game.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-12 h-12">
                      <Image
                        src={getTeamLogo(game.home_team.id)}
                        alt={game.home_team.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-white">
                        {game.home_team.name}
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          game.home_team.score > game.away_team.score
                            ? "text-neon-green"
                            : "text-gray-500"
                        }`}
                      >
                        {game.home_team.score}
                      </p>
                    </div>
                  </div>

                  <div className="px-8 text-gray-600 font-bold">VS</div>

                  {/* Away Team */}
                  <div className="flex items-center gap-4 flex-1 justify-end text-right">
                    <div>
                      <p className="font-bold text-lg text-white">
                        {game.away_team.name}
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          game.away_team.score > game.home_team.score
                            ? "text-neon-green"
                            : "text-gray-500"
                        }`}
                      >
                        {game.away_team.score}
                      </p>
                    </div>
                    <div className="relative w-12 h-12">
                      <Image
                        src={getTeamLogo(game.away_team.id)}
                        alt={game.away_team.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
