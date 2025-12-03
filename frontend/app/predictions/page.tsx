"use client";

import Link from "next/link";
import { ArrowLeft, TrendingUp, Calendar, Users } from "lucide-react";
import { useState } from "react";

export default function PredictionsPage() {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");

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
                  <option value="LAL">Los Angeles Lakers</option>
                  <option value="GSW">Golden State Warriors</option>
                  <option value="BOS">Boston Celtics</option>
                  <option value="MIA">Miami Heat</option>
                  <option value="MIL">Milwaukee Bucks</option>
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
                  <option value="LAL">Los Angeles Lakers</option>
                  <option value="GSW">Golden State Warriors</option>
                  <option value="BOS">Boston Celtics</option>
                  <option value="MIA">Miami Heat</option>
                  <option value="MIL">Milwaukee Bucks</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Game Date</label>
                <input
                  type="datetime-local"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                />
              </div>

              <button className="w-full bg-neon-green hover:bg-green-400 text-black py-3 rounded-lg font-bold transition-all hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                Get Prediction
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-neon-green/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Prediction Results
            </h2>

            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">
                Select teams and click &quot;Get Prediction&quot; to see results
              </p>
            </div>
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
