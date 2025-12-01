"use client";

import { useState } from "react";
import { createPrediction } from "@/lib/actions/predictions";
import { Game, PredictionResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PredictButtonProps {
  game: Game;
  userId: string;
}

export function PredictButton({ game, userId }: PredictButtonProps) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await createPrediction({
        home_team_id: game.home_team_id,
        away_team_id: game.away_team_id,
        game_date: game.game_date,
        user_id: userId,
      });

      setPrediction(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create prediction"
      );
    } finally {
      setLoading(false);
    }
  };

  if (prediction) {
    return (
      <Card className="p-4 mt-4">
        <h3 className="font-semibold mb-2">Prediction Result</h3>
        <div className="space-y-2">
          <p>
            Predicted Winner:{" "}
            <span className="font-bold">
              {prediction.predicted_winner === "home"
                ? game.home_team?.name
                : game.away_team?.name}
            </span>
          </p>
          <p>Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
          <div className="text-sm text-gray-600">
            <p>
              Home Win: {(prediction.home_win_probability * 100).toFixed(1)}%
            </p>
            <p>
              Away Win: {(prediction.away_win_probability * 100).toFixed(1)}%
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Model: {prediction.model_version}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Button onClick={handlePredict} disabled={loading} className="w-full">
        {loading ? "Predicting..." : "Get AI Prediction"}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
