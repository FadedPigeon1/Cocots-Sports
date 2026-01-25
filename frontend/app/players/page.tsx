"use client";

import { useEffect, useState } from "react";
import { Search, Filter, User, Activity, Zap } from "lucide-react";
import { getPlayers } from "@/lib/api/client";

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPlayers();
        setPlayers(data);
      } catch (error) {
        console.error("Failed to fetch players:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredPlayers = Array.isArray(players) ? players.filter(
    (player) =>
      player.PLAYER_NAME?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.TEAM_ABBREVIATION?.toLowerCase().includes(searchQuery.toLowerCase()),
  ) : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Player Stats</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive player metrics and performance analysis.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-64 text-foreground placeholder-muted-foreground"
            />
          </div>
          <button className="p-2 bg-card border border-border rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="p-4 font-semibold text-sm text-foreground">
                  Player
                </th>
                <th className="p-4 font-semibold text-sm text-foreground">
                  Team
                </th>
                <th className="p-4 font-semibold text-sm text-foreground">
                  PTS
                </th>
                <th className="p-4 font-semibold text-sm text-foreground">
                  REB
                </th>
                <th className="p-4 font-semibold text-sm text-foreground">
                  AST
                </th>
                <th className="p-4 font-semibold text-sm text-foreground">
                  Efficiency
                </th>
                <th className="p-4 font-semibold text-sm text-foreground">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                   <td colSpan={7} className="p-8 text-center text-muted-foreground">Loading players...</td>
                </tr>
              ) : filteredPlayers.map((player) => (
                <tr key={player.PLAYER_ID} className="hover:bg-secondary/20 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">{player.PLAYER_NAME}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-secondary rounded text-xs font-mono text-muted-foreground">{player.TEAM_ABBREVIATION}</span>
                  </td>
                  <td className="p-4 font-bold text-foreground">{player.PTS}</td>
                  <td className="p-4 text-muted-foreground">{player.REB}</td>
                  <td className="p-4 text-muted-foreground">{player.AST}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-medium text-foreground">{(player.FG_PCT * 100).toFixed(1)}%</span>
                       <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-blue-500 rounded-full" 
                           style={{ width: `${player.FG_PCT * 100}%` }} 
                         />
                       </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
