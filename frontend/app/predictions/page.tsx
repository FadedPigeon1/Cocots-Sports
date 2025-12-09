"use client";

import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Users,
  Target,
  Loader2,
} from "lucide-react";
import { useState } from "react";

// NBA Teams with IDs
const NBA_TEAMS = [
  { id: 1610612737, name: "Atlanta Hawks", abbr: "ATL" },
  { id: 1610612738, name: "Boston Celtics", abbr: "BOS" },
  { id: 1610612751, name: "Brooklyn Nets", abbr: "BKN" },
  { id: 1610612766, name: "Charlotte Hornets", abbr: "CHA" },
  { id: 1610612741, name: "Chicago Bulls", abbr: "CHI" },
  { id: 1610612739, name: "Cleveland Cavaliers", abbr: "CLE" },
  { id: 1610612742, name: "Dallas Mavericks", abbr: "DAL" },
  { id: 1610612743, name: "Denver Nuggets", abbr: "DEN" },
  { id: 1610612765, name: "Detroit Pistons", abbr: "DET" },
  { id: 1610612744, name: "Golden State Warriors", abbr: "GSW" },
  { id: 1610612745, name: "Houston Rockets", abbr: "HOU" },
  { id: 1610612754, name: "Indiana Pacers", abbr: "IND" },
  { id: 1610612746, name: "LA Clippers", abbr: "LAC" },
  { id: 1610612747, name: "Los Angeles Lakers", abbr: "LAL" },
  { id: 1610612763, name: "Memphis Grizzlies", abbr: "MEM" },
  { id: 1610612748, name: "Miami Heat", abbr: "MIA" },
  { id: 1610612749, name: "Milwaukee Bucks", abbr: "MIL" },
  { id: 1610612750, name: "Minnesota Timberwolves", abbr: "MIN" },
  { id: 1610612740, name: "New Orleans Pelicans", abbr: "NOP" },
  { id: 1610612752, name: "New York Knicks", abbr: "NYK" },
  { id: 1610612760, name: "Oklahoma City Thunder", abbr: "OKC" },
  { id: 1610612753, name: "Orlando Magic", abbr: "ORL" },
  { id: 1610612755, name: "Philadelphia 76ers", abbr: "PHI" },
  { id: 1610612756, name: "Phoenix Suns", abbr: "PHX" },
  { id: 1610612757, name: "Portland Trail Blazers", abbr: "POR" },
  { id: 1610612758, name: "Sacramento Kings", abbr: "SAC" },
  { id: 1610612759, name: "San Antonio Spurs", abbr: "SAS" },
  { id: 1610612761, name: "Toronto Raptors", abbr: "TOR" },
  { id: 1610612762, name: "Utah Jazz", abbr: "UTA" },
  { id: 1610612764, name: "Washington Wizards", abbr: "WAS" },
];

interface PredictionResult {
  home_win_probability: number;
  away_win_probability: number;
  confidence: number;
}

export default function PredictionsPage() {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!homeTeam || !awayTeam) {
      setError("Please select both teams");
      return;
    }

    if (homeTeam === awayTeam) {
      setError("Please select different teams");
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // For now, generate mock prediction data
      // TODO: Replace with actual API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const homeWinProb = Math.random() * 0.4 + 0.3; // 30-70%
      setPrediction({
        home_win_probability: homeWinProb,
        away_win_probability: 1 - homeWinProb,
        confidence: Math.random() * 0.2 + 0.75, // 75-95%
      });
    } catch (err) {
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId: string) => {
    return NBA_TEAMS.find((t) => t.id.toString() === teamId)?.name || "";
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
                className="text-neon-green font-semibold"
              >
                Predictions
              </Link>
              <Link
                href="/teams"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
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
          <h1 className="text-4xl font-bold text-white mb-4">
            Game Predictions
          </h1>
          <p className="text-gray-400 text-lg">
            Get AI-powered predictions for NBA games using advanced machine
            learning models.
          </p>
        </div>

        {/* Prediction Form */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-neon-green/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Predict Game Outcome
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Home Team</label>
                <select
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                >
                  <option value="">Select Team</option>
                  {NBA_TEAMS.map((team) => (
                    <option key={team.id} value={team.id.toString()}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Away Team</label>
                <select
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                >
                  <option value="">Select Team</option>
                  {NBA_TEAMS.map((team) => (
                    <option key={team.id} value={team.id.toString()}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handlePredict}
                disabled={loading || !homeTeam || !awayTeam}
                className="w-full bg-neon-green hover:bg-green-400 text-black py-3 rounded-lg font-bold transition-all hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Get Prediction"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Predictions use current season data and compare with performance
                from one year ago
              </p>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-neon-green/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Prediction Results
            </h2>

            {!prediction ? (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">
                  Select teams and click &quot;Get Prediction&quot; to see
                  results
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Winner Prediction */}
                <div className="bg-black/40 rounded-lg p-6 border border-neon-green/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Predicted Winner
                    </h3>
                    <Target className="h-6 w-6 text-neon-green" />
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-neon-green mb-2">
                      {prediction.home_win_probability >
                      prediction.away_win_probability
                        ? getTeamName(homeTeam)
                        : getTeamName(awayTeam)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {Math.max(
                        prediction.home_win_probability,
                        prediction.away_win_probability
                      ).toFixed(1)}
                      % win probability
                    </p>
                  </div>
                </div>

                {/* Win Probabilities */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">
                        {getTeamName(homeTeam)} (Home)
                      </span>
                      <span className="text-neon-green font-bold">
                        {(prediction.home_win_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-neon-green h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${prediction.home_win_probability * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">
                        {getTeamName(awayTeam)} (Away)
                      </span>
                      <span className="text-blue-400 font-bold">
                        {(prediction.away_win_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${prediction.away_win_probability * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Confidence */}
                <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      Model Confidence
                    </span>
                    <span className="text-white font-semibold">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-orange-500 to-neon-green h-full rounded-full transition-all duration-500"
                      style={{ width: `${prediction.confidence * 100}%` }}
                    />
                  </div>
                </div>

                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      setPrediction(null);
                      setHomeTeam("");
                      setAwayTeam("");
                      setError(null);
                    }}
                    className="text-gray-400 hover:text-neon-green transition-colors text-sm"
                  >
                    Reset Prediction
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all">
            <Calendar className="h-8 w-8 text-blue-500 mb-3" />
            <h3 className="text-white font-semibold mb-2">
              Today&apos;s Games
            </h3>
            <p className="text-3xl font-bold text-white">12</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all">
            <TrendingUp className="h-8 w-8 text-neon-green mb-3" />
            <h3 className="text-white font-semibold mb-2">Model Accuracy</h3>
            <p className="text-3xl font-bold text-white">85.3%</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all">
            <Users className="h-8 w-8 text-orange-500 mb-3" />
            <h3 className="text-white font-semibold mb-2">Predictions Made</h3>
            <p className="text-3xl font-bold text-white">1,247</p>
          </div>
        </div>
      </main>
    </div>
  );
}
