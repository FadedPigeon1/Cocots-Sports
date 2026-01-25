"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Star, MoreHorizontal } from "lucide-react";
import { getStandings } from "@/lib/api/client";

export default function Teams() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getStandings();
        setTeams(data);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTeams = Array.isArray(teams)
    ? teams.filter((team) =>
        team.Team?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">NBA Teams</h1>
          <p className="text-muted-foreground mt-2">
            Track performance, prediction history, and stats.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search teams..."
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

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          // Skeletons
          [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-card border border-border rounded-xl animate-pulse"
            />
          ))
        ) : filteredTeams.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No teams found matching your search.
          </div>
        ) : (
          filteredTeams.map((team, idx) => (
            <div
              key={idx}
              className="group bg-card border border-border rounded-xl p-6 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

              <div className="flex justify-between items-start mb-6">
                <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center text-xl font-bold text-primary shadow-inner">
                  {team.Team.substring(0, 3).toUpperCase()}
                </div>
                <button className="text-muted-foreground hover:text-yellow-500 transition-colors">
                  <Star className="h-5 w-5" />
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {team.Team}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {team.W} - {team.L} Record
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Win %
                  </span>
                  <span className="font-bold text-foreground">
                    {team["W/L%"]}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Conf Rank
                  </span>
                  <span className="font-bold text-foreground">#{idx + 1}</span>
                </div>
                <button className="p-1 hover:bg-secondary rounded hover:text-foreground text-muted-foreground transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
