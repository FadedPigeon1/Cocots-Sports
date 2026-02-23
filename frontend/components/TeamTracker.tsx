"use client";

import { useState } from "react";
import TrackerHeader from "./team-tracker/TrackerHeader";
import TrackerStats from "./team-tracker/TrackerStats";
import TrackerCharts from "./team-tracker/TrackerCharts";

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

const MOCK_COMPARISON_DATA = [
  { game: 1, wins: 1, losses: 0, year: "2025" },
  { game: 5, wins: 5, losses: 0, year: "2025" },
  { game: 10, wins: 9, losses: 1, year: "2025" },
  { game: 15, wins: 14, losses: 1, year: "2025" },
  { game: 20, wins: 19, losses: 1, year: "2025" },
  { game: 21, wins: 20, losses: 1, year: "2025" },
];

const RECENT_GAMES = [
  { opponent: "BOS", teamScore: 112, oppScore: 108, result: "W" },
  { opponent: "MIA", teamScore: 105, oppScore: 102, result: "W" },
  { opponent: "NYK", teamScore: 98, oppScore: 104, result: "L" },
  { opponent: "PHI", teamScore: 120, oppScore: 115, result: "W" },
  { opponent: "TOR", teamScore: 118, oppScore: 110, result: "W" },
];

const TEAM_STATS = [
  { subject: "Offense", A: 95, fullMark: 100 },
  { subject: "Defense", A: 88, fullMark: 100 },
  { subject: "Pace", A: 75, fullMark: 100 },
  { subject: "Rebounding", A: 82, fullMark: 100 },
  { subject: "Playmaking", A: 90, fullMark: 100 },
  { subject: "Shooting", A: 85, fullMark: 100 },
];

const TEAM_DETAILS: Record<
  string,
  {
    record: string;
    conferenceRank: string;
    streak: string;
    lastLoss: string;
    offRating: string;
    offRatingRank: string;
    netRating: string;
    netRatingRank: string;
  }
> = {
  "Detroit Pistons": {
    record: "17-4",
    conferenceRank: "1st in East",
    streak: "W5",
    lastLoss: "vs NYK",
    offRating: "118.5",
    offRatingRank: "Top 5 in League",
    netRating: "+8.2",
    netRatingRank: "Elite Tier",
  },
  "Oklahoma City Thunder": {
    record: "22-1",
    conferenceRank: "1st in West",
    streak: "W15",
    lastLoss: "vs DEN",
    offRating: "120.1",
    offRatingRank: "1st in League",
    netRating: "+12.5",
    netRatingRank: "Historic Pace",
  },
};

const DEFAULT_STATS = {
  record: "10-10",
  conferenceRank: "8th in Conf",
  streak: "L1",
  lastLoss: "vs BOS",
  offRating: "112.0",
  offRatingRank: "League Average",
  netRating: "+0.5",
  netRatingRank: "Mid Tier",
};

export default function TeamTracker() {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("Detroit Pistons");
  const [comparisonTeam, setComparisonTeam] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const currentStats = TEAM_DETAILS[selectedTeam] || DEFAULT_STATS;

  const trajectoryData = MOCK_DATA.map((item, index) => ({
    ...item,
    wins2024: showComparison ? MOCK_HISTORICAL_DATA[index]?.wins : undefined,
    winsComparison: comparisonTeam
      ? MOCK_COMPARISON_DATA[index]?.wins
      : undefined,
  }));

  return (
    <div className="space-y-6">
      <TrackerHeader
        selectedTeam={selectedTeam}
        comparisonTeam={comparisonTeam}
        isEditing={isEditing}
        showComparison={showComparison}
        onSelectedTeamChange={setSelectedTeam}
        onComparisonTeamChange={setComparisonTeam}
        onToggleEditing={() => setIsEditing(!isEditing)}
        onToggleComparison={() => setShowComparison(!showComparison)}
      />

      <TrackerStats stats={currentStats} />

      <TrackerCharts
        selectedTeam={selectedTeam}
        comparisonTeam={comparisonTeam}
        showComparison={showComparison}
        trajectoryData={trajectoryData}
        recentGames={RECENT_GAMES}
        teamStats={TEAM_STATS}
      />
    </div>
  );
}
