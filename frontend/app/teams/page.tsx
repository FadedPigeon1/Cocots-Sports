"use client";

import { useEffect, useState } from "react";
import { Search, Trophy, TrendingUp, Star, ChevronRight } from "lucide-react";
import { getStandings } from "@/lib/api/client";
import Link from "next/link";
import { useTracking } from "@/lib/hooks/useTracking";

type Conference = "all" | "East" | "West";

export default function Teams() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isTeamTracked, trackTeam, untrackTeam, user } = useTracking();
  const [conferenceFilter, setConferenceFilter] = useState<Conference>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getStandings();
        console.log("Team data:", data);

        let formattedTeams: any[] = [];

        // Adapter for different API response formats
        if (Array.isArray(data)) {
          // Format 1: Flat array (Original expectation)
          formattedTeams = data;
        } else if (data && (data.eastern || data.western)) {
          // Format 2: Object with eastern/western arrays (Current API)
          const mapTeam = (t: any, conf: string) => ({
            ...t,
            TEAM_NAME: t.team,
            TEAM_ID: t.team_id,
            W: t.wins,
            L: t.losses,
            W_PCT: t.win_pct,
            CONF_RANK: t.rank,
            CONFERENCE: conf,
            // Fallbacks for missing stats
            PTS: t.pts || 0,
            GP: t.wins + t.losses || 1,
            PLUS_MINUS: t.plus_minus || 0,
          });

          const east = (data.eastern || []).map((t: any) => mapTeam(t, "East"));
          const west = (data.western || []).map((t: any) => mapTeam(t, "West"));
          formattedTeams = [...east, ...west];
        }

        if (formattedTeams.length > 0) {
          setTeams(formattedTeams);
          setError(null);
        } else {
          setTeams([]);
          if (!data) {
            setError("No data received from API");
          } else {
            // Keep error if strictly invalid, but empty array is not invalid
            setError("No teams found in API response");
          }
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error);
        setError("Failed to load teams. Please check if the API is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTeams = Array.isArray(teams)
    ? teams
        .filter((team) => {
          const name = team.TEAM_NAME || "Unknown Team";
          const matchesSearch = name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesConference =
            conferenceFilter === "all" || team.CONFERENCE === conferenceFilter;
          return matchesSearch && matchesConference;
        })
        .sort((a, b) => (b.W_PCT || 0) - (a.W_PCT || 0))
    : [];

  // Get top 5 teams overall
  const topTeams = Array.isArray(teams)
    ? [...teams].sort((a, b) => (b.W_PCT || 0) - (a.W_PCT || 0)).slice(0, 5)
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">NBA Teams</h1>
          <p className="text-muted-foreground mt-2">
            Current standings, stats, and conference rankings.
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
        </div>
      </div>

      {/* Top Teams Banner */}
      {!loading && topTeams.length > 0 && (
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-foreground">
              League Leaders
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {topTeams.map((team, idx) => (
              <Link
                href={`/team/${team.TEAM_ID}`}
                key={team.TEAM_ID}
                className="flex items-center gap-3 p-3 bg-card/50 rounded-lg hover:bg-card transition-colors group"
              >
                <span
                  className={`text-lg font-bold ${idx === 0 ? "text-yellow-500" : idx === 1 ? "text-zinc-400" : idx === 2 ? "text-amber-600" : "text-muted-foreground"}`}
                >
                  #{idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {team.TEAM_NAME}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {team.W}-{team.L} ({((team.W_PCT || 0) * 100).toFixed(1)}%)
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex items-center justify-between">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Conference Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-4">
        {(["all", "East", "West"] as Conference[]).map((conf) => (
          <button
            key={conf}
            onClick={() => setConferenceFilter(conf)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              conferenceFilter === conf
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {conf === "all" ? "All Teams" : `${conf}ern Conference`}
            <span className="ml-2 text-xs opacity-70">
              (
              {conf === "all"
                ? Array.isArray(teams)
                  ? teams.length
                  : 0
                : Array.isArray(teams)
                  ? teams.filter((t) => t.CONFERENCE === conf).length
                  : 0}
              )
            </span>
          </button>
        ))}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-52 bg-card border border-border rounded-xl animate-pulse"
            />
          ))
        ) : filteredTeams.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No teams found matching your criteria.
          </div>
        ) : (
          filteredTeams.map((team) => (
            <Link
              href={`/team/${team.TEAM_ID}`}
              key={team.TEAM_ID}
              className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:translate-y-[-4px]"
            >
              {/* Conf Header Stripe */}
              <div
                className={`h-2 w-full ${
                  team.CONFERENCE === "East" ? "bg-blue-500" : "bg-red-500"
                }`}
              />

              <div className="p-6 flex-1 flex flex-col">
                {/* Header: Rank + Name */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center text-lg font-black text-primary shadow-sm border border-border/50">
                      {(team.TEAM_NAME || "UNK")
                        .split(" ")
                        .pop()
                        ?.substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {team.TEAM_NAME}
                      </h3>
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {team.CONFERENCE}ern Conf
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Ensure we have a valid user before trying to track
                        if (!user) {
                          alert("Please sign in to track teams");
                          return;
                        }

                        const isTracked = isTeamTracked(team.TEAM_ID);
                        if (isTracked) {
                          untrackTeam(team.TEAM_ID);
                        } else {
                          // Generate simple abbr - take first 3 chars or first letter of each word
                          const words = team.TEAM_NAME.split(" ");
                          const abbr =
                            words.length > 1
                              ? words
                                  .map((w: string) => w[0])
                                  .join("")
                                  .substring(0, 3)
                                  .toUpperCase()
                              : team.TEAM_NAME.substring(0, 3).toUpperCase();

                          trackTeam(team.TEAM_ID, team.TEAM_NAME, abbr);
                        }
                      }}
                      className={`p-2 rounded-lg transition-all ${
                        isTeamTracked(team.TEAM_ID)
                          ? "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20"
                          : "text-muted-foreground hover:text-yellow-500 hover:bg-secondary"
                      }`}
                      title={
                        isTeamTracked(team.TEAM_ID)
                          ? "Untrack Team"
                          : "Track Team"
                      }
                    >
                      <Star
                        className={`h-5 w-5 ${isTeamTracked(team.TEAM_ID) ? "fill-current" : ""}`}
                      />
                    </button>

                    <div
                      className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border bg-card shadow-sm ${
                        team.CONFERENCE === "East"
                          ? "border-blue-500/30 text-blue-500"
                          : "border-red-500/30 text-red-500"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase leading-none mb-0.5">
                        Rank
                      </span>
                      <span className="text-sm font-black leading-none">
                        {team.CONF_RANK || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Stat: Record */}
                <div className="mb-6 text-center py-3 bg-secondary/30 rounded-lg border border-border/50">
                  <div className="text-3xl font-black tracking-tight text-foreground flex items-center justify-center gap-2">
                    {team.W}
                    <span className="text-muted-foreground text-xl">-</span>
                    {team.L}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div
                      className={`h-2 w-2 rounded-full ${(team.W_PCT || 0) >= 0.5 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500"}`}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {((team.W_PCT || 0) * 100).toFixed(1)}% Win Rate
                    </span>
                  </div>
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      PPG
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {(team.PTS / (team.GP || 1)).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Diff +/-
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        (team.PLUS_MINUS || 0) > 0
                          ? "text-green-500"
                          : (team.PLUS_MINUS || 0) < 0
                            ? "text-red-500"
                            : "text-muted-foreground"
                      }`}
                    >
                      {(team.PLUS_MINUS || 0) > 0 ? "+" : ""}
                      {(team.PLUS_MINUS || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Footer Action */}
              <div className="px-6 py-3 bg-secondary/20 border-t border-border flex items-center justify-between text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                <span>View Team Analysis</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
