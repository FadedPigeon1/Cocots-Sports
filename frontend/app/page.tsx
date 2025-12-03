import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  Activity,
  TrendingUp,
  Calendar,
  Trophy,
} from "lucide-react";
import AuthButton from "@/components/AuthButton";

// Mock Data for Standings (2025-26 Season)
const WEST_STANDINGS = [
  {
    rank: 1,
    team: "OKC Thunder",
    record: "21-1",
    logo: "https://cdn.nba.com/logos/nba/1610612760/global/L/logo.svg",
  },
  {
    rank: 2,
    team: "Denver Nuggets",
    record: "18-4",
    logo: "https://cdn.nba.com/logos/nba/1610612743/global/L/logo.svg",
  },
  {
    rank: 3,
    team: "Minnesota Timberwolves",
    record: "16-5",
    logo: "https://cdn.nba.com/logos/nba/1610612750/global/L/logo.svg",
  },
  {
    rank: 4,
    team: "Dallas Mavericks",
    record: "15-6",
    logo: "https://cdn.nba.com/logos/nba/1610612742/global/L/logo.svg",
  },
  {
    rank: 5,
    team: "Phoenix Suns",
    record: "14-7",
    logo: "https://cdn.nba.com/logos/nba/1610612756/global/L/logo.svg",
  },
  {
    rank: 6,
    team: "LA Lakers",
    record: "14-8",
    logo: "https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg",
  },
  {
    rank: 7,
    team: "Golden State Warriors",
    record: "13-9",
    logo: "https://cdn.nba.com/logos/nba/1610612744/global/L/logo.svg",
  },
  {
    rank: 8,
    team: "Sacramento Kings",
    record: "12-10",
    logo: "https://cdn.nba.com/logos/nba/1610612758/global/L/logo.svg",
  },
];

const EAST_STANDINGS = [
  {
    rank: 1,
    team: "Detroit Pistons",
    record: "17-4",
    logo: "https://cdn.nba.com/logos/nba/1610612765/global/L/logo.svg",
  },
  {
    rank: 2,
    team: "Boston Celtics",
    record: "16-5",
    logo: "https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg",
  },
  {
    rank: 3,
    team: "Milwaukee Bucks",
    record: "15-6",
    logo: "https://cdn.nba.com/logos/nba/1610612749/global/L/logo.svg",
  },
  {
    rank: 4,
    team: "Cleveland Cavaliers",
    record: "14-7",
    logo: "https://cdn.nba.com/logos/nba/1610612739/global/L/logo.svg",
  },
  {
    rank: 5,
    team: "Orlando Magic",
    record: "13-8",
    logo: "https://cdn.nba.com/logos/nba/1610612753/global/L/logo.svg",
  },
  {
    rank: 6,
    team: "New York Knicks",
    record: "13-9",
    logo: "https://cdn.nba.com/logos/nba/1610612752/global/L/logo.svg",
  },
  {
    rank: 7,
    team: "Philadelphia 76ers",
    record: "12-9",
    logo: "https://cdn.nba.com/logos/nba/1610612755/global/L/logo.svg",
  },
  {
    rank: 8,
    team: "Indiana Pacers",
    record: "11-10",
    logo: "https://cdn.nba.com/logos/nba/1610612754/global/L/logo.svg",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-neon-green/20 backdrop-blur-sm bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-neon-green" />
              <span className="text-2xl font-bold text-white tracking-wider">
                COCOTS<span className="text-neon-green">SPORTS</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/teams"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
                Teams
              </Link>
              <Link
                href="/predictions"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
                Predictions
              </Link>
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            2025-26 SEASON
            <span className="block text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
              STANDINGS
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Live tracking of conference leaders and playoff pictures.
          </p>
        </div>

        {/* Standings Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {/* Western Conference */}
          <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl overflow-hidden">
            <div className="bg-black/60 p-4 border-b border-neon-green/20 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-neon-green">WESTERN</span> CONFERENCE
              </h2>
              <Trophy className="text-gray-600 h-6 w-6" />
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {WEST_STANDINGS.map((team) => (
                  <div
                    key={team.team}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-mono font-bold w-6 ${
                          team.rank <= 6 ? "text-neon-green" : "text-gray-500"
                        }`}
                      >
                        {team.rank}
                      </span>
                      <div className="relative w-8 h-8">
                        <Image
                          src={team.logo}
                          alt={team.team}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-semibold text-white group-hover:text-neon-green transition-colors">
                        {team.team}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white/80">
                      {team.record}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Eastern Conference */}
          <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl overflow-hidden">
            <div className="bg-black/60 p-4 border-b border-neon-green/20 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-neon-green">EASTERN</span> CONFERENCE
              </h2>
              <Trophy className="text-gray-600 h-6 w-6" />
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {EAST_STANDINGS.map((team) => (
                  <div
                    key={team.team}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-mono font-bold w-6 ${
                          team.rank <= 6 ? "text-neon-green" : "text-gray-500"
                        }`}
                      >
                        {team.rank}
                      </span>
                      <div className="relative w-8 h-8">
                        <Image
                          src={team.logo}
                          alt={team.team}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-semibold text-white group-hover:text-neon-green transition-colors">
                        {team.team}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white/80">
                      {team.record}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">85%</div>
            <div className="text-white/60">Prediction Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">30</div>
            <div className="text-white/60">NBA Teams</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">450+</div>
            <div className="text-white/60">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-white/60">Live Updates</div>
          </div>
        </div>
      </main>
    </div>
  );
}
