"use client";

import { useState } from "react";
import Image from "next/image";
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
import { Plus, X, Trophy, TrendingUp, Activity, Target } from "lucide-react";

// Team Logo Mapping
const TEAM_LOGOS: Record<string, string> = {
  Pistons: "https://cdn.nba.com/logos/nba/1610612765/global/L/logo.svg",
  Thunder: "https://cdn.nba.com/logos/nba/1610612760/global/L/logo.svg",
  Lakers: "https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg",
  Celtics: "https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg",
};

// Mock data for win/loss trend
const MOCK_DATA = [
  { game: 1, wins: 1, losses: 0, year: "2025" },
  { game: 5, wins: 4, losses: 1, year: "2025" },
  { game: 10, wins: 8, losses: 2, year: "2025" },
  { game: 15, wins: 12, losses: 3, year: "2025" },
  { game: 20, wins: 16, losses: 4, year: "2025" },
  { game: 21, wins: 17, losses: 4, year: "2025" },
];

const MOCK_HISTORICAL_DATA = [
  { game: 1, wins: 0, losses: 1, year: "2024" },
  { game: 5, wins: 1, losses: 4, year: "2024" },
  { game: 10, wins: 2, losses: 8, year: "2024" },
  { game: 15, wins: 2, losses: 13, year: "2024" },
  { game: 20, wins: 2, losses: 18, year: "2024" },
  { game: 21, wins: 2, losses: 19, year: "2024" },
];

// Mock data for recent games (Bar Chart)
const RECENT_GAMES = [
  { opponent: "BOS", teamScore: 112, oppScore: 108, result: "W" },
  { opponent: "MIA", teamScore: 105, oppScore: 102, result: "W" },
  { opponent: "NYK", teamScore: 98, oppScore: 104, result: "L" },
  { opponent: "PHI", teamScore: 120, oppScore: 115, result: "W" },
  { opponent: "TOR", teamScore: 118, oppScore: 110, result: "W" },
];

// Mock data for team stats (Radar Chart)
const TEAM_STATS = [
  { subject: "Offense", A: 95, fullMark: 100 },
  { subject: "Defense", A: 88, fullMark: 100 },
  { subject: "Pace", A: 75, fullMark: 100 },
  { subject: "Rebounding", A: 82, fullMark: 100 },
  { subject: "Playmaking", A: 90, fullMark: 100 },
  { subject: "Shooting", A: 85, fullMark: 100 },
];

export default function TeamTracker() {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("Pistons");
  const [isEditing, setIsEditing] = useState(false);

  const data = MOCK_DATA.map((item, index) => ({
    ...item,
    wins2024: showComparison ? MOCK_HISTORICAL_DATA[index]?.wins : undefined,
  }));

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 bg-white/5 rounded-full p-2 border border-white/10">
              <Image
                src={TEAM_LOGOS[selectedTeam] || TEAM_LOGOS["Pistons"]}
                alt={`${selectedTeam} Logo`}
                fill
                className="object-contain p-2"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                {selectedTeam}{" "}
                <span className="text-neon-green">Dashboard</span>
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                2025-26 Season Analysis
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {isEditing ? <X size={16} /> : <Plus size={16} />}
            {isEditing ? "Close Options" : "Customize View"}
          </button>
        </div>

        {isEditing && (
          <div className="mt-6 p-4 bg-black/40 rounded-lg border border-white/10 animate-fade-in">
            <h3 className="text-white font-semibold mb-3">
              Dashboard Controls
            </h3>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  showComparison
                    ? "bg-neon-green text-black border-neon-green"
                    : "bg-transparent text-white border-white/20 hover:border-neon-green"
                }`}
              >
                {showComparison ? "Hide 2024 Comparison" : "Compare with 2024"}
              </button>

              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-black border border-white/20 text-white rounded-lg px-4 py-2 focus:border-neon-green outline-none"
              >
                <option value="Pistons">Detroit Pistons</option>
                <option value="Thunder">OKC Thunder</option>
                <option value="Lakers">Lakers</option>
                <option value="Celtics">Celtics</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 p-6 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">Season Record</p>
            <Trophy className="text-neon-green h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-white">17-4</p>
          <p className="text-neon-green text-xs mt-1">1st in East</p>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">Win Streak</p>
            <TrendingUp className="text-blue-500 h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-white">W5</p>
          <p className="text-gray-500 text-xs mt-1">Last Loss: vs NYK</p>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">Offensive Rating</p>
            <Target className="text-orange-500 h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-white">118.5</p>
          <p className="text-neon-green text-xs mt-1">Top 5 in League</p>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">Net Rating</p>
            <Activity className="text-purple-500 h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-white">+8.2</p>
          <p className="text-neon-green text-xs mt-1">Elite Tier</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Win/Loss Trend (Takes up 2 columns) */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-neon-green/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">
            Season Trajectory
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
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
                  name="2025 Wins"
                  stroke="#39FF14"
                  strokeWidth={3}
                  dot={{ fill: "#39FF14", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
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

        {/* Team Stats Radar (Takes up 1 column) */}
        <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Team Identity</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={TEAM_STATS}>
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
            <BarChart data={RECENT_GAMES}>
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
    </div>
  );
}
