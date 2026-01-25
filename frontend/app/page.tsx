"use client";

import Link from "next/link";
import { BarChart3, Activity, ArrowRight, Target, Users } from "lucide-react";
import { useEffect, useState } from "react";

// Mock Data for Standings (Fallback)
const FEATURED_GAMES = [
  {
    id: 1,
    home: "Lakers",
    away: "Warriors",
    time: "7:30 PM",
    prediction: "Lakers 62%",
    stadium: "Crypto.com Arena",
  },
  {
    id: 2,
    home: "Celtics",
    away: "Heat",
    time: "8:00 PM",
    prediction: "Celtics 75%",
    stadium: "TD Garden",
  },
  {
    id: 3,
    home: "Nuggets",
    away: "Suns",
    time: "10:00 PM",
    prediction: "Nuggets 55%",
    stadium: "Ball Arena",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background -z-10" />
        <div className="absolute top-0 right-0 p-20 bg-primary/20 blur-[120px] rounded-full -z-10 opacity-30" />
        <div className="absolute bottom-0 left-0 p-20 bg-nba-red/10 blur-[100px] rounded-full -z-10 opacity-20" />

        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                v2.0 Now Available
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Predict the Game, <br />
                <span className="text-primary">Master the Stats</span>
              </h1>
              <p className="max-w-[600px] mx-auto lg:mx-0 text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Advanced machine learning models for NBA game predictions,
                real-time player statistics, and deep analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/predictions"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Get Predictions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  View Dashboard
                </Link>
              </div>
            </div>

            {/* Hero Card / Feature Preview */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Activity className="text-primary h-5 w-5" />
                    Live Predictions
                  </h3>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    Updated Live
                  </span>
                </div>

                <div className="space-y-4">
                  {FEATURED_GAMES.map((game) => (
                    <div
                      key={game.id}
                      className="group flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-transparent hover:border-primary/20 transition-all cursor-default"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {game.away} @ {game.home}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {game.stadium} • {game.time}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">
                          {game.prediction}
                        </div>
                        <div className="h-1.5 w-24 bg-secondary mt-1 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: game.prediction.split(" ")[1] }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
              <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-500">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">ML Predictions</h3>
              <p className="text-muted-foreground">
                Our XGBoost models analyze thousands of data points to predict
                game outcomes with high accuracy.
              </p>
            </div>
            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
              <div className="p-3 w-fit rounded-xl bg-green-500/10 text-green-500">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Advanced Stats</h3>
              <p className="text-muted-foreground">
                Deep dive into player efficiency ratings, shooting splits, and
                team performance metrics.
              </p>
            </div>
            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
              <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-500">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Player Tracking</h3>
              <p className="text-muted-foreground">
                Follow your favorite players and get real-time updates on their
                performance and milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to elevate your game analysis?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of other basketball enthusiasts using CocotsSports
              for their daily insights.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground text-background px-8 text-sm font-medium transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
