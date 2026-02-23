"use client";

import { useState, useEffect } from "react";
import { TrendingUp, History, Users } from "lucide-react";
import { compareTeams, getTeamHistory } from "@/lib/api/client";
import { ALL_TEAMS, AVAILABLE_SEASONS } from "@/lib/constants/nba-teams";
import type { TeamData, TeamSeasonData, ComparisonData } from "@/lib/types/team";
import TeamCompareTab from "./team-comparison/TeamCompareTab";
import TeamHistoryTab from "./team-comparison/TeamHistoryTab";

export default function TeamComparison() {
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<{
    teams: TeamData[];
    comparison_data: ComparisonData[];
  } | null>(null);
  const [historyData, setHistoryData] = useState<{
    team: { id: number; name: string; abbreviation: string };
    seasons: TeamSeasonData[];
    comparison_data: ComparisonData[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<"compare" | "history">("compare");
  const [historyTeam, setHistoryTeam] = useState<number | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([
    "2023-24",
    "2024-25",
    "2025-26",
  ]);
  const [season, setSeason] = useState("2025-26");

  useEffect(() => {
    const fetchComparison = async () => {
      if (selectedTeams.length < 1) {
        setComparisonData(null);
        return;
      }
      setLoading(true);
      try {
        const data = await compareTeams(selectedTeams, season);
        setComparisonData(data);
      } catch (error) {
        console.error("Failed to fetch team comparison:", error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "compare") fetchComparison();
  }, [selectedTeams, season, activeTab]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!historyTeam) {
        setHistoryData(null);
        return;
      }
      setLoading(true);
      try {
        const data = await getTeamHistory(historyTeam, selectedSeasons);
        setHistoryData(data);
      } catch (error) {
        console.error("Failed to fetch team history:", error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "history") fetchHistory();
  }, [historyTeam, selectedSeasons, activeTab]);

  const addTeam = (teamId: number) => {
    if (selectedTeams.length < 5 && !selectedTeams.includes(teamId)) {
      setSelectedTeams([...selectedTeams, teamId]);
    }
    setShowTeamSelector(false);
  };

  const removeTeam = (teamId: number) => {
    setSelectedTeams(selectedTeams.filter((id) => id !== teamId));
  };

  const toggleSeason = (s: string) => {
    if (selectedSeasons.includes(s)) {
      if (selectedSeasons.length > 1) {
        setSelectedSeasons(selectedSeasons.filter((ss) => ss !== s));
      }
    } else {
      setSelectedSeasons([...selectedSeasons, s].sort());
    }
  };

  const getTeamNameById = (teamId: number) => {
    const team = ALL_TEAMS.find((t) => t.id === String(teamId));
    return team?.name || "Unknown Team";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl border border-border p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Team Comparison
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Compare teams head-to-head or track a team across different
              seasons
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-secondary/50 rounded-lg p-1 border border-border">
            <button
              onClick={() => setActiveTab("compare")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "compare"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Compare Teams
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "history"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <History className="h-4 w-4 inline mr-2" />
              Season History
            </button>
          </div>
        </div>
      </div>

      {/* Compare Teams Tab */}
      {activeTab === "compare" && (
        <TeamCompareTab
          selectedTeams={selectedTeams}
          comparisonData={comparisonData}
          loading={loading}
          season={season}
          availableSeasons={AVAILABLE_SEASONS}
          showTeamSelector={showTeamSelector}
          onAddTeam={addTeam}
          onRemoveTeam={removeTeam}
          onToggleSelector={() => setShowTeamSelector(!showTeamSelector)}
          onSeasonChange={setSeason}
          getTeamNameById={getTeamNameById}
        />
      )}

      {/* Season History Tab */}
      {activeTab === "history" && (
        <TeamHistoryTab
          historyTeam={historyTeam}
          historyData={historyData}
          loading={loading}
          selectedSeasons={selectedSeasons}
          onHistoryTeamChange={setHistoryTeam}
          onToggleSeason={toggleSeason}
        />
      )}
    </div>
  );
}
