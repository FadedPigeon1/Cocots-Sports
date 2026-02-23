"use client";

import { TrendingUp, Target } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface PerformanceDataPoint {
  game: string;
  points: number;
  opponent_points: number;
  fg_pct: number;
  margin: number;
}

interface RadarDataPoint {
  stat: string;
  value: number;
  fullMark: number;
}

interface TeamChartsProps {
  teamName: string;
  performanceData: PerformanceDataPoint[];
  radarData: RadarDataPoint[];
}

export default function TeamCharts({
  teamName,
  performanceData,
  radarData,
}: TeamChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
      {/* Performance Chart */}
      <div className="lg:col-span-2 card-base p-6 border border-border bg-card rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Performance Trend (Last 10)
          </h3>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="game"
                stroke="#a1a1aa"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                dy={10}
              />
              <YAxis
                stroke="#a1a1aa"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line
                type="monotone"
                dataKey="points"
                name="Team Points"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#3b82f6",
                  strokeWidth: 2,
                  stroke: "#09090b",
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="opponent_points"
                name="Opponent Points"
                stroke="#a1a1aa"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Team Profile
        </h3>
        <div className="h-[300px] w-full flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis
                dataKey="stat"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name={teamName}
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Normalized relative to league averages
        </div>
      </div>
    </div>
  );
}
