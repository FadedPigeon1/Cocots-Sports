"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Swords } from "lucide-react";
import { getPredictions, getTeams } from "@/lib/api/predictions";
import PredictionsList from "@/components/predictions/PredictionsList";
import MatchupSimulator from "@/components/predictions/MatchupSimulator";
import AnalysisModal from "@/components/predictions/AnalysisModal";

interface Prediction {
  date: string;
  home_team: string;
  home_team_id: number;
  away_team: string;
  away_team_id: number;
  predicted_winner: string;
  win_probability: number;
}

interface Team {
  id: number;
  full_name: string;
  abbreviation: string;
}

type GameCount = 3 | 6 | 9;

export default function Predictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameCount, setGameCount] = useState<GameCount>(3);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    async function fetchPredictions() {
      setLoading(true);
      try {
        const [data, teamsData] = await Promise.all([
          getPredictions(gameCount),
          getTeams(),
        ]);
        setPredictions(data);
        setTeams(teamsData);
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPredictions();
  }, [gameCount]);

  const chartData = [
    { name: "Mon", accuracy: 65 },
    { name: "Tue", accuracy: 59 },
    { name: "Wed", accuracy: 80 },
    { name: "Thu", accuracy: 81 },
    { name: "Fri", accuracy: 56 },
    { name: "Sat", accuracy: 55 },
    { name: "Sun", accuracy: 78 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Predictions</h1>
        <p className="text-muted-foreground mt-2">
          Machine learning powered game analysis and outcome forecasts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="col-span-1 lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Model Accuracy Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e720" />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "8px",
                    color: "#f4f4f5",
                  }}
                  itemStyle={{ color: "#e4e4e7" }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Today&apos;s Summary
            </h3>
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground text-sm">
                  Total Games
                </span>
                <span className="font-bold text-foreground">8</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground text-sm">
                  High Confidence (&gt;70%)
                </span>
                <span className="font-bold text-green-500">3 games</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">
                  Avg. Win Probability
                </span>
                <span className="font-bold text-foreground">64%</span>
              </div>
            </div>

            <button
              onClick={() => setShowAnalysis(true)}
              className="w-full mt-6 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              View Detailed Analysis
            </button>
            <button
              onClick={() => setShowSimulator(true)}
              className="w-full mt-2 bg-secondary text-secondary-foreground py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
            >
              <Swords className="h-4 w-4" />
              Simulate Matchup
            </button>
          </div>
        </div>
      </div>

      {/* Predictions List */}
      <PredictionsList
        predictions={predictions}
        loading={loading}
        gameCount={gameCount}
        onGameCountChange={setGameCount}
      />

      {/* Modals */}
      {showSimulator && (
        <MatchupSimulator
          teams={teams}
          onClose={() => setShowSimulator(false)}
        />
      )}

      {showAnalysis && <AnalysisModal onClose={() => setShowAnalysis(false)} />}
    </div>
  );
}
