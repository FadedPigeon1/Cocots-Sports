"use client";

import Image from "next/image";
import { Plus, X } from "lucide-react";
import {
  EASTERN_CONFERENCE,
  WESTERN_CONFERENCE,
} from "@/lib/constants/nba-teams";

const getTeamLogo = (teamName: string) => {
  const ALL_TEAMS = [...EASTERN_CONFERENCE, ...WESTERN_CONFERENCE];
  const team = ALL_TEAMS.find(
    (t) => t.name === teamName || t.name.includes(teamName),
  );
  if (team) {
    return `https://cdn.nba.com/logos/nba/${team.id}/global/L/logo.svg`;
  }
  return "https://cdn.nba.com/logos/nba/1610612765/global/L/logo.svg";
};

interface TrackerHeaderProps {
  selectedTeam: string;
  comparisonTeam: string | null;
  isEditing: boolean;
  showComparison: boolean;
  onSelectedTeamChange: (team: string) => void;
  onComparisonTeamChange: (team: string | null) => void;
  onToggleEditing: () => void;
  onToggleComparison: () => void;
}

export default function TrackerHeader({
  selectedTeam,
  comparisonTeam,
  isEditing,
  showComparison,
  onSelectedTeamChange,
  onComparisonTeamChange,
  onToggleEditing,
  onToggleComparison,
}: TrackerHeaderProps) {
  return (
    <div className="bg-gray-900/50 border border-neon-green/20 rounded-xl p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 bg-white/5 rounded-full p-2 border border-white/10">
            <Image
              src={getTeamLogo(selectedTeam)}
              alt={`${selectedTeam} Logo`}
              fill
              className="object-contain p-2"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              {selectedTeam} <span className="text-neon-green">Dashboard</span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              2025-26 Season Analysis
            </p>
          </div>
        </div>
        <button
          onClick={onToggleEditing}
          className="bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          {isEditing ? <X size={16} /> : <Plus size={16} />}
          {isEditing ? "Close Options" : "Customize View"}
        </button>
      </div>

      {isEditing && (
        <div className="mt-6 p-6 bg-black/40 rounded-lg border border-white/10 animate-fade-in backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary Team Selection */}
            <div className="space-y-3">
              <h3 className="text-neon-green font-semibold text-sm uppercase tracking-wider">
                Primary Team
              </h3>
              <div className="relative">
                <select
                  value={selectedTeam}
                  onChange={(e) => onSelectedTeamChange(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 text-white rounded-lg px-4 py-3 focus:border-neon-green outline-none transition-colors appearance-none cursor-pointer hover:border-white/40"
                >
                  <optgroup label="Eastern Conference">
                    {EASTERN_CONFERENCE.map((team) => (
                      <option key={team.id} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Western Conference">
                    {WESTERN_CONFERENCE.map((team) => (
                      <option key={team.id} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Select the main team to analyze for the 2025-26 season.
              </p>
            </div>

            {/* Comparison Options */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
                  Comparison
                </h3>
                {comparisonTeam && (
                  <button
                    onClick={() => onComparisonTeamChange(null)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <select
                    value={comparisonTeam || ""}
                    onChange={(e) =>
                      onComparisonTeamChange(e.target.value || null)
                    }
                    className="w-full bg-black/50 border border-white/20 text-white rounded-lg px-4 py-3 focus:border-blue-500 outline-none transition-colors appearance-none cursor-pointer hover:border-white/40"
                  >
                    <option value="">Select Team to Compare...</option>
                    <optgroup label="Eastern Conference">
                      {EASTERN_CONFERENCE.filter(
                        (t) => t.name !== selectedTeam,
                      ).map((team) => (
                        <option key={team.id} value={team.name}>
                          {team.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Western Conference">
                      {WESTERN_CONFERENCE.filter(
                        (t) => t.name !== selectedTeam,
                      ).map((team) => (
                        <option key={team.id} value={team.name}>
                          {team.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>

                <button
                  onClick={onToggleComparison}
                  className={`w-full px-4 py-2 rounded-lg border transition-all text-sm font-medium flex items-center justify-center gap-2 ${
                    showComparison
                      ? "bg-white/10 text-white border-white/30"
                      : "bg-transparent text-gray-400 border-white/10 hover:border-white/30"
                  }`}
                >
                  {showComparison ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-neon-green"></span>
                      Hide Historical (2024)
                    </>
                  ) : (
                    "Show Historical (2024)"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
