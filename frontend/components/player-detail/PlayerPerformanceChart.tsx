"use client";

import { Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  game: string;
  pts: number;
  reb: number;
  ast: number;
}

interface PlayerPerformanceChartProps {
  chartData: ChartDataPoint[];
}

export default function PlayerPerformanceChart({
  chartData,
}: PlayerPerformanceChartProps) {
  return (
    <div className="lg:col-span-2 card-base p-6 border border-border bg-card rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Performance Trend
        </h3>
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
              dataKey="pts"
              name="Points"
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
              dataKey="reb"
              name="Rebounds"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ast"
              name="Assists"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
