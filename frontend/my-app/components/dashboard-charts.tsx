"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "Week 1", accuracy: 65 },
  { name: "Week 2", accuracy: 59 },
  { name: "Week 3", accuracy: 80 },
  { name: "Week 4", accuracy: 81 },
  { name: "Week 5", accuracy: 56 },
  { name: "Week 6", accuracy: 55 },
  { name: "Week 7", accuracy: 40 },
];

const confidenceData = [
  { name: "Mon", high: 4, medium: 2, low: 1 },
  { name: "Tue", high: 3, medium: 5, low: 2 },
  { name: "Wed", high: 5, medium: 2, low: 1 },
  { name: "Thu", high: 2, medium: 3, low: 4 },
  { name: "Fri", high: 6, medium: 1, low: 1 },
  { name: "Sat", high: 4, medium: 4, low: 2 },
  { name: "Sun", high: 7, medium: 2, low: 0 },
];

export function DashboardCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Prediction Accuracy Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#39ff14"
                  strokeWidth={2}
                  dot={{ fill: "#39ff14" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Predictions by Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="high"
                  stackId="1"
                  stroke="#39ff14"
                  fill="#39ff14"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="medium"
                  stackId="1"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="low"
                  stackId="1"
                  stroke="#15803d"
                  fill="#15803d"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
