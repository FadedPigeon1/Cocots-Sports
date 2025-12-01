"use client";

import { Prediction } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface PredictionHistoryProps {
  predictions: Prediction[];
}

export function PredictionHistory({ predictions }: PredictionHistoryProps) {
  if (predictions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No predictions yet. Make your first prediction!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {predictions.map((prediction) => (
        <Card key={prediction.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {prediction.status === "pending" ? (
                  <Clock className="h-5 w-5 text-yellow-500" />
                ) : prediction.is_correct ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <h3 className="font-semibold">
                  {prediction.game?.home_team?.name} vs{" "}
                  {prediction.game?.away_team?.name}
                </h3>
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  Predicted:{" "}
                  <span className="font-medium">
                    {prediction.predicted_winner === "home"
                      ? prediction.game?.home_team?.name
                      : prediction.game?.away_team?.name}
                  </span>
                </p>
                <p className="text-gray-600">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </p>
                {prediction.status === "completed" && (
                  <p>
                    Actual Winner:{" "}
                    <span className="font-medium">
                      {prediction.actual_winner === "home"
                        ? prediction.game?.home_team?.name
                        : prediction.game?.away_team?.name}
                    </span>
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(prediction.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Badge
              variant={
                prediction.status === "pending"
                  ? "secondary"
                  : prediction.is_correct
                  ? "default"
                  : "destructive"
              }
            >
              {prediction.status === "pending"
                ? "Pending"
                : prediction.is_correct
                ? "Correct"
                : "Incorrect"}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
