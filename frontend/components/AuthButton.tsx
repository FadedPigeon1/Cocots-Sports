"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  ChevronDown,
  Star,
  UserCircle,
  Settings,
} from "lucide-react";
import { signOut } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";
import { useTracking } from "@/lib/hooks/useTracking";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Helper to get logo URL
const getTeamLogo = (teamId: string) => {
  return `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`;
};

export default function AuthButton() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { trackedTeams, trackedPlayers, user, loading } = useTracking();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setDropdownOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex gap-3">
        <div className="h-10 w-20 bg-secondary rounded-lg animate-pulse" />
      </div>
    );
  }

  if (user) {
    const displayName = user.email?.split("@")[0] || "User";

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary text-foreground rounded-lg transition-colors border border-border"
        >
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <UserCircle className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-medium max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info */}
            <div className="p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracked Teams */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="h-3 w-3" />
                  Tracked Teams
                </span>
                <span className="text-xs text-muted-foreground">
                  {trackedTeams.length}
                </span>
              </div>
              {trackedTeams.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {trackedTeams.slice(0, 5).map((team) => (
                    <Link
                      key={team.id}
                      href={`/team/${team.team_id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary transition-colors group"
                    >
                      <div className="relative w-5 h-5">
                        <Image
                          src={getTeamLogo(String(team.team_id))}
                          alt={team.team_name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1 truncate">
                        {team.team_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {team.team_abbreviation}
                      </span>
                    </Link>
                  ))}
                  {trackedTeams.length > 5 && (
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block text-xs text-primary hover:underline px-2 py-1"
                    >
                      View all {trackedTeams.length} teams →
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  No teams tracked yet
                </p>
              )}
            </div>

            {/* Tracked Players */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  Tracked Players
                </span>
                <span className="text-xs text-muted-foreground">
                  {trackedPlayers.length}
                </span>
              </div>
              {trackedPlayers.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {trackedPlayers.slice(0, 5).map((player) => (
                    <Link
                      key={player.id}
                      href={`/player/${player.player_id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary transition-colors group"
                    >
                      <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1 truncate">
                        {player.player_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {player.team_abbreviation}
                      </span>
                    </Link>
                  ))}
                  {trackedPlayers.length > 5 && (
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block text-xs text-primary hover:underline px-2 py-1"
                    >
                      View all {trackedPlayers.length} players →
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  No players tracked yet
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="p-2">
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary transition-colors text-sm text-foreground"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors text-sm text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Link
        href="/login"
        className="px-4 py-2 text-foreground hover:text-primary transition-colors text-sm font-medium"
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
      >
        Sign Up
      </Link>
    </div>
  );
}
