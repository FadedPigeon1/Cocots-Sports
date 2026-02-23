"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Target, Zap, Trophy, Activity, Brain, X } from "lucide-react";

interface AnalysisModalProps {
  onClose: () => void;
}

export default function AnalysisModal({ onClose }: AnalysisModalProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              AI Performance Analysis
            </h2>
            <p className="text-muted-foreground text-sm">
              Deep dive into today&apos;s model predictions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Confidence Distribution Chart */}
          <div className="bg-secondary/20 p-6 rounded-xl border border-border">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-blue-500" />
              Confidence Distribution
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { range: "50-60%", count: 2 },
                    { range: "60-70%", count: 3 },
                    { range: "70-80%", count: 2 },
                    { range: "80%+", count: 1 },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e4e4e720"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="range"
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                    }}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {[
                      { range: "50-60%", count: 2 },
                      { range: "60-70%", count: 3 },
                      { range: "70-80%", count: 2 },
                      { range: "80%+", count: 1 },
                    ].map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 3 ? "#22c55e" : "#3b82f6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Factors */}
          <div className="space-y-6">
            <div className="bg-secondary/20 p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-yellow-500" />
                Model Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                  <div>
                    <span className="font-medium text-foreground block">
                      Home Court Advantage
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Teams playing at home are seeing a +4.2% win rate increase
                      today.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <span className="font-medium text-foreground block">
                      Defense Efficiency
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Defensive rating is weighted 15% higher in today&apos;s
                      matchups.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2" />
                  <div>
                    <span className="font-medium text-foreground block">
                      Rest Days
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Teams with 2+ days rest are favored in 3 of 4 matchups.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/20 p-6 rounded-xl border border-border">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top Pick of the Day
              </h3>
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="font-bold text-xl">LAL</div>
                  <div className="text-xs text-muted-foreground">vs</div>
                  <div className="font-bold text-xl text-muted-foreground">
                    BOS
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-500">82%</div>
                  <div className="text-xs text-muted-foreground">
                    Confidence
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-red-500" />
            Live Model Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="text-sm text-muted-foreground">Log Loss</div>
              <div className="text-xl font-bold">0.423</div>
            </div>
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="text-sm text-muted-foreground">ROC AUC</div>
              <div className="text-xl font-bold">0.781</div>
            </div>
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="text-sm text-muted-foreground">Brier Score</div>
              <div className="text-xl font-bold">0.152</div>
            </div>
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="text-sm text-muted-foreground">
                Training Samples
              </div>
              <div className="text-xl font-bold">12,450</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
