"use client";

import { useState, useEffect } from "react";
import { User, TrendingUp, History } from "lucide-react";
import { comparePlayers, getPlayerHistory, getPlayers } from "@/lib/api/client";
import { AVAILABLE_SEASONS } from "@/lib/constants/nba-teams";
import type { PlayerData, PlayerSeasonData, ComparisonData } from "@/lib/types/player";
import PlayerCompareTab from "./player-comparison/PlayerCompareTab";
import PlayerHistoryTab from "./player-comparison/PlayerHistoryTab";

export default function PlayerComparison() {
  const [allPlayers, setAllPlayers] = useState<
    { PLAYER_ID: number; PLAYER_NAME: string; TEAM_ABBREVIATION: string }[]
  >([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<{
    players: PlayerData[];
    comparison_data: ComparisonData[];
  } | null>(null);
  const [historyData, setHistoryData] = useState<{
    player: { id: number; name: string; team: string; position: string };
    seasons: PlayerSeasonData[];
    comparison_data: ComparisonData[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<"compare" | "history">("compare");
  const [historyPlayer, setHistoryPlayer] = useState<number | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([
    "2023-24",
    "2024-25",
    "2025-26",
  ]);
  const [season, setSeason] = useState("2025-26");

  // Fetch all players on mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await getPlayers();
        setAllPlayers(data);
      } catch (error) {
        console.error("Failed to fetch players:", error);
      }
    };
    fetchPlayers();
  }, []);

  // Fetch comparison data when players change
  useEffect(() => {
    const fetchComparison = async () => {
      if (selectedPlayers.length < 1) {
        setComparisonData(null);
        return;
      }
      setLoading(true);
      try {
        const data = await comparePlayers(selectedPlayers, season);
        setComparisonData(data);
      } catch (error) {
        console.error("Failed to fetch comparison:", error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "compare") fetchComparison();
  }, [selectedPlayers, season, activeTab]);

  // Fetch history data when history player changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!historyPlayer) {
        setHistoryData(null);
        return;
      }
      setLoading(true);
      try {
        const data = await getPlayerHistory(historyPlayer, selectedSeasons);
        setHistoryData(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "history") fetchHistory();
  }, [historyPlayer, selectedSeasons, activeTab]);

  const filteredPlayers = allPlayers.filter(
    (player) =>
      player.PLAYER_NAME.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedPlayers.includes(player.PLAYER_ID),
  );

  const addPlayer = (playerId: number) => {
    if (selectedPlayers.length < 5 && !selectedPlayers.includes(playerId)) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
    setShowPlayerSearch(false);
    setSearchTerm("");
  };

  const removePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl border border-border p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Player Comparison
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Compare players head-to-head or track a player across seasons
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
              Compare Players
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

      {/* Compare Players Tab */}
      {activeTab === "compare" && (
        <PlayerCompareTab
          selectedPlayers={selectedPlayers}
          comparisonData={comparisonData}
          loading={loading}
          season={season}
          availableSeasons={AVAILABLE_SEASONS}
          filteredPlayers={filteredPlayers}
          showPlayerSearch={showPlayerSearch}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          onToggleSearch={() => setShowPlayerSearch(!showPlayerSearch)}
          onSeasonChange={setSeason}
        />
      )}

      {/* Season History Tab */}
      {activeTab === "history" && (
        <PlayerHistoryTab
          allPlayers={allPlayers}
          historyPlayer={historyPlayer}
          historyData={historyData}
          loading={loading}
          selectedSeasons={selectedSeasons}
          onHistoryPlayerChange={setHistoryPlayer}
          onToggleSeason={toggleSeason}
        />
      )}
    </div>
  );
}
