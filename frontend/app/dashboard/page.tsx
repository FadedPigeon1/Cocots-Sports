"use client";

import { useState } from "react";
import {
  Trophy,
  TrendingUp,
  Users,
  Target,
  ArrowUpRight,
  TrendingDown,
  BarChart3,
  GitCompare,
  User,
  History,
} from "lucide-react";
import PlayerComparison from "@/components/PlayerComparison";
import TeamComparison from "@/components/TeamComparison";

type DashboardView = "overview" | "player-compare" | "team-compare";

export default function Dashboard() {
  const [stats] = useState({
    activePredictions: 12,
    successRate: 78,
    trackedTeams: 5,
    recentWins: 8,
  });
  const [activeView, setActiveView] = useState<DashboardView>("overview");

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back to your sports analytics command center.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium">
            Download Report
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            New Prediction
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card rounded-xl border border-border p-2 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveView("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === "overview"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveView("player-compare")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === "player-compare"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <User className="h-4 w-4" />
          Player Comparison
        </button>
        <button
          onClick={() => setActiveView("team-compare")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === "team-compare"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <GitCompare className="h-4 w-4" />
          Team Comparison
        </button>
      </div>

      {/* Overview View */}
      {activeView === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <span className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                  +12% <ArrowUpRight className="h-3 w-3 ml-1" />
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {stats.activePredictions}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Active Predictions
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                  +4.5% <ArrowUpRight className="h-3 w-3 ml-1" />
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {stats.successRate}%
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <span className="flex items-center text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  0% --
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {stats.trackedTeams}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tracked Teams
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <span className="flex items-center text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                  -2% <TrendingDown className="h-3 w-3 ml-1" />
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {stats.recentWins}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Recent Wins</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => setActiveView("player-compare")}
              className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Compare Players
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Compare up to 5 players head-to-head or track player
                    progression
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveView("team-compare")}
              className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg text-green-500 group-hover:bg-green-500/20 transition-colors">
                  <GitCompare className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Compare Teams
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Compare teams or see how a team evolved across seasons
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveView("team-compare")}
              className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                  <History className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Historic Comparisons
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Compare 2016 Warriors vs 2022 Warriors and more
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Recent Predictions
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="font-bold text-xs">LAL</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Lakers vs Warriors
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Today, 7:00 PM
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      Win (65%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Team Updates
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm text-foreground">
                        LeBron James listed as questionable for tonight&apos;s
                        game.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Player Comparison View */}
      {activeView === "player-compare" && <PlayerComparison />}

      {/* Team Comparison View */}
      {activeView === "team-compare" && <TeamComparison />}
    </div>
  );
}
