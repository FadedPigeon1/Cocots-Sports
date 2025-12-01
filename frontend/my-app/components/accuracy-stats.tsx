"use client";

import { UserAccuracy } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AccuracyStatsProps {
  accuracy: UserAccuracy;
}

export function AccuracyStats({ accuracy }: AccuracyStatsProps) {
  const overallAccuracy = accuracy.accuracy * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Overall Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">
                {overallAccuracy.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-600">
                {accuracy.correct_predictions}/{accuracy.total_predictions}{" "}
                correct
              </span>
            </div>
            <Progress value={overallAccuracy} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By Confidence Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ConfidenceItem
              label="High Confidence (70%+)"
              data={accuracy.by_confidence.high}
            />
            <ConfidenceItem
              label="Medium Confidence (60-70%)"
              data={accuracy.by_confidence.medium}
            />
            <ConfidenceItem
              label="Low Confidence (<60%)"
              data={accuracy.by_confidence.low}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConfidenceItem({
  label,
  data,
}: {
  label: string;
  data: { total: number; correct: number; accuracy: number };
}) {
  const percentage = data.accuracy * 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-gray-600">
          {data.correct}/{data.total}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-gray-500 mt-1">
        {percentage.toFixed(1)}% accurate
      </p>
    </div>
  );
}
