import Link from "next/link";
import { BarChart3, Activity, TrendingUp, Calendar } from "lucide-react";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-neon-green/20 backdrop-blur-sm bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-neon-green" />
              <span className="text-2xl font-bold text-white tracking-wider">
                COCOTS<span className="text-neon-green">SPORTS</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/teams"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
                Teams
              </Link>
              <Link
                href="/predictions"
                className="text-white/80 hover:text-neon-green transition-colors"
              >
                Predictions
              </Link>
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            TRACK YOUR TEAM'S
            <span className="block text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
              PERFORMANCE
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Advanced analytics to track wins, losses, and historical trends.
            Compare current season performance against previous years.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-neon-green hover:bg-green-400 text-black px-8 py-3 rounded-lg font-bold transition-all hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]"
            >
              Start Tracking
            </Link>
            <Link
              href="/predictions"
              className="border border-neon-green/50 hover:border-neon-green text-neon-green px-8 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm"
            >
              View Predictions
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all group">
            <TrendingUp className="h-12 w-12 text-neon-green mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">
              Performance Tracking
            </h3>
            <p className="text-gray-400">
              Visualize win/loss trends with interactive graphs and real-time
              data updates.
            </p>
          </div>

          <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all group">
            <Calendar className="h-12 w-12 text-neon-green mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">
              Historical Comparison
            </h3>
            <p className="text-gray-400">
              Compare current season stats with previous years to spot
              improvement trends.
            </p>
          </div>

          <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all group">
            <BarChart3 className="h-12 w-12 text-neon-green mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">
              AI Predictions
            </h3>
            <p className="text-gray-400">
              Get ML-powered insights on upcoming games as a supplementary tool.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">85%</div>
            <div className="text-white/60">Prediction Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">30</div>
            <div className="text-white/60">NBA Teams</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">450+</div>
            <div className="text-white/60">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-white/60">Live Updates</div>
          </div>
        </div>
      </main>
    </div>
  );
}
