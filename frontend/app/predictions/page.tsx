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
import { Target, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { getPredictions } from "@/lib/api/predictions";

interface Prediction {
  date: string;
  home_team: string;
  away_team: string;
  predicted_winner: string;
  win_probability: number;
}

export default function Predictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPredictions() {
      try {
        const data = await getPredictions();
        setPredictions(data);
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPredictions();
  }, []);

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

            <button className="w-full mt-6 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              View Detailed Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Predictions List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Games
          </h3>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading predictions...
            </div>
          ) : predictions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No predictions available for today&apos;s games.</p>
              <p className="text-sm mt-2">Check back later for updates.</p>
            </div>
          ) : (
            predictions.map((game, idx) => (
              <div
                key={idx}
                className="p-4 hover:bg-secondary/30 transition-colors flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-8 flex-1">
                  <div className="text-right flex-1">
                    <span className="font-bold text-foreground block">
                      {game.home_team}
                    </span>
                    <span className="text-xs text-muted-foreground">Home</span>
                  </div>
                  <div className="px-3 py-1 bg-secondary rounded text-xs font-mono text-muted-foreground">
                    VS
                  </div>
                  <div className="text-left flex-1">
                    <span className="font-bold text-foreground block">
                      {game.away_team}
                    </span>
                    <span className="text-xs text-muted-foreground">Away</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                      Predicted Winner
                    </span>
                    <span className="font-bold text-primary">
                      {game.predicted_winner}
                    </span>
                  </div>

                  <div className="text-center w-24">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                      Confidence
                    </span>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${game.win_probability * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-primary font-bold mt-1 block">
                      {(game.win_probability * 100).toFixed(1)}%
                    </span>
                  </div>

                  <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
