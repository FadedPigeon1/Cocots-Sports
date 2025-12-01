"use client";

import { Game, Prediction, UserAccuracy } from "@/lib/types";
import { PredictButton } from "@/components/predict-button";
import { PredictionHistory } from "@/components/prediction-history";
import { AccuracyStats } from "@/components/accuracy-stats";
import { DashboardCharts } from "@/components/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

// Mock Data for UI Demonstration
const MOCK_USER_ID = "user_123";

const MOCK_TEAMS = {
  LAL: {
    id: 1,
    api_team_id: 1610612747,
    name: "Los Angeles Lakers",
    abbreviation: "LAL",
    city: "Los Angeles",
    conference: "West",
    division: "Pacific",
  },
  BOS: {
    id: 2,
    api_team_id: 1610612738,
    name: "Boston Celtics",
    abbreviation: "BOS",
    city: "Boston",
    conference: "East",
    division: "Atlantic",
  },
  GSW: {
    id: 3,
    api_team_id: 1610612744,
    name: "Golden State Warriors",
    abbreviation: "GSW",
    city: "San Francisco",
    conference: "West",
    division: "Pacific",
  },
  MIA: {
    id: 4,
    api_team_id: 1610612748,
    name: "Miami Heat",
    abbreviation: "MIA",
    city: "Miami",
    conference: "East",
    division: "Southeast",
  },
};

const UPCOMING_GAMES: Game[] = [
  {
    id: 101,
    api_game_id: 22300001,
    game_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    home_team_id: 1,
    away_team_id: 2,
    status: "scheduled",
    season: "2024-25",
    venue: "Crypto.com Arena",
    home_team: MOCK_TEAMS.LAL,
    away_team: MOCK_TEAMS.BOS,
  },
  {
    id: 102,
    api_game_id: 22300002,
    game_date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    home_team_id: 4,
    away_team_id: 3,
    status: "scheduled",
    season: "2024-25",
    venue: "Kaseya Center",
    home_team: MOCK_TEAMS.MIA,
    away_team: MOCK_TEAMS.GSW,
  },
];

const RECENT_PREDICTIONS: Prediction[] = [
  {
    id: "pred_1",
    user_id: MOCK_USER_ID,
    game_id: 99,
    home_team_id: 3,
    away_team_id: 1,
    game_date: new Date(Date.now() - 86400000).toISOString(),
    predicted_winner: "home",
    home_win_probability: 0.65,
    away_win_probability: 0.35,
    confidence: 0.65,
    model_version: "1.0.0",
    status: "completed",
    is_correct: true,
    actual_winner: "home",
    created_at: new Date(Date.now() - 90000000).toISOString(),
    game: {
      id: 99,
      api_game_id: 22300000,
      game_date: new Date(Date.now() - 86400000).toISOString(),
      home_team_id: 3,
      away_team_id: 1,
      status: "completed",
      season: "2024-25",
      home_team: MOCK_TEAMS.GSW,
      away_team: MOCK_TEAMS.LAL,
    },
  },
];

const USER_ACCURACY: UserAccuracy = {
  user_id: MOCK_USER_ID,
  total_predictions: 15,
  correct_predictions: 12,
  accuracy: 0.8,
  by_confidence: {
    high: { total: 5, correct: 5, accuracy: 1.0 },
    medium: { total: 7, correct: 5, accuracy: 0.71 },
    low: { total: 3, correct: 2, accuracy: 0.66 },
  },
};

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome back! Here are today's top NBA matchups and your latest stats.
        </p>
      </section>

      <DashboardCharts />

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Upcoming Games */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Upcoming Games
          </h2>
          <div className="grid gap-4">
            {UPCOMING_GAMES.map((game) => (
              <Card
                key={game.id}
                className="overflow-hidden border-l-4 border-l-primary"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Teams */}
                    <div className="flex items-center gap-8 flex-1">
                      <div className="text-center w-32">
                        <div className="text-2xl font-bold">
                          {game.home_team?.abbreviation}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {game.home_team?.name}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-muted-foreground">
                        VS
                      </div>
                      <div className="text-center w-32">
                        <div className="text-2xl font-bold">
                          {game.away_team?.abbreviation}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {game.away_team?.name}
                        </div>
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(game.game_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{game.venue}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="w-full md:w-auto">
                      <PredictButton game={game} userId={MOCK_USER_ID} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Stats & History */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Your Performance
            </h2>
            <AccuracyStats accuracy={USER_ACCURACY} />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Recent History
            </h2>
            <PredictionHistory predictions={RECENT_PREDICTIONS} />
          </section>
        </div>
      </div>
    </div>
  );
}
