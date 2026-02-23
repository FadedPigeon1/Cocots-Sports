"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface TrajectoryDataPoint {
  game: number;
  wins: number;
  losses: number;
  year: string;
  wins2024?: number;
  winsComparison?: number;
}

interface RecentGame {
  opponent: string;
  teamScore: number;
  oppScore: number;
  result: string;
}

interface RadarStat {
  subject: string;
  A: number;
  fullMark: number;
}

interface TrackerChartsProps {
  selectedTeam: string;
  comparisonTeam: string | null;
  showComparison: boolean;
  trajectoryData: TrajectoryDataPoint[];
  recentGames: RecentGame[];
  teamStats: RadarStat[];
}

export default function TrackerCharts({
  selectedTeam,
  comparisonTeam,
  showComparison,
  trajectoryData,
  recentGames,
  teamStats,
}: TrackerChartsProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Win/Loss Trend */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-neon-green/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">
            Season Trajectory
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="game"
                  stroke="#666"
                  label={{
                    value: "Games Played",
                    position: "insideBottom",
                    offset: -5,
                    fill: "#666",
                  }}
                />
                <YAxis
                  stroke="#666"
                  label={{
                    value: "Wins",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#666",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #333",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="wins"
                  name={`${selectedTeam} (2025)`}
                  stroke="#39FF14"
                  strokeWidth={3}
                  dot={{ fill: "#39FF14", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                {comparisonTeam && (
                  <Line
                    type="monotone"
                    dataKey="winsComparison"
                    name={`${comparisonTeam} (2025)`}
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {showComparison && (
                  <Line
                    type="monotone"
                    dataKey="wins2024"
                    name="2024 Wins"
                    stroke="#666"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#666" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Stats Radar */}
        <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Team Identity</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={teamStats}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#999" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar
                  name={selectedTeam}
                  dataKey="A"
                  stroke="#39FF14"
                  strokeWidth={2}
                  fill="#39FF14"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #333",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Games Performance */}
      <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">
          Recent Game Performance
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recentGames}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#333"
                vertical={false}
              />
              <XAxis dataKey="opponent" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #333",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar
                dataKey="teamScore"
                name="Points Scored"
                fill="#39FF14"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="oppScore"
                name="Opponent Points"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
