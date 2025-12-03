"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Activity,
  Calendar,
  TrendingUp,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TeamTracker from "@/components/TeamTracker";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
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
              Team <span className="text-neon-green">Tracker</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Monitor real-time performance and historical trends.
            </p>
          </div>

          {/* Main Tracker Component */}
          <div className="mb-8">
            <TeamTracker />
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">Total Predictions</h3>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">1,247</p>
              <p className="text-neon-green text-sm">↑ 12% from last week</p>
            </div>

            <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">Accuracy Rate</h3>
                <TrendingUp className="h-8 w-8 text-neon-green" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">85.3%</p>
              <p className="text-neon-green text-sm">↑ 2.1% improvement</p>
            </div>

            <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">Games Today</h3>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">12</p>
              <p className="text-gray-500 text-sm">Across both conferences</p>
            </div>

            <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">Active Users</h3>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">3,542</p>
              <p className="text-neon-green text-sm">↑ 8% this month</p>
            </div>
          </div>

          {/* Recent Predictions */}
          <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">
              Recent Predictions
            </h2>

            <div className="space-y-4">
              {[
                {
                  home: "Lakers",
                  away: "Warriors",
                  prediction: "Lakers Win",
                  confidence: 78,
                  time: "2 hours ago",
                },
                {
                  home: "Celtics",
                  away: "Heat",
                  prediction: "Celtics Win",
                  confidence: 85,
                  time: "5 hours ago",
                },
                {
                  home: "Bucks",
                  away: "Nets",
                  prediction: "Bucks Win",
                  confidence: 72,
                  time: "1 day ago",
                },
              ].map((pred, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/10 hover:border-neon-green/30 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">
                      {pred.home} vs {pred.away}
                    </p>
                    <p className="text-gray-500 text-sm">{pred.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {pred.prediction}
                    </p>
                    <p className="text-neon-green text-sm">
                      {pred.confidence}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
