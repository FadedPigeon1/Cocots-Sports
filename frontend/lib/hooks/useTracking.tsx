"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  User,
  AuthChangeEvent,
  Session,
  SupabaseClient,
} from "@supabase/supabase-js";

export interface TrackedTeam {
  id: string;
  team_id: number;
  team_name: string;
  team_abbreviation: string;
  created_at: string;
}

export interface TrackedPlayer {
  id: string;
  player_id: number;
  player_name: string;
  team_abbreviation: string;
  created_at: string;
}

interface TrackingContextType {
  user: User | null;
  trackedTeams: TrackedTeam[];
  trackedPlayers: TrackedPlayer[];
  loading: boolean;
  trackTeam: (
    teamId: number,
    teamName: string,
    teamAbbreviation: string,
  ) => Promise<{ data: any; error: any }>;
  untrackTeam: (teamId: number) => Promise<{ error: any }>;
  trackPlayer: (
    playerId: number,
    playerName: string,
    teamAbbreviation: string,
  ) => Promise<{ data: any; error: any }>;
  untrackPlayer: (playerId: number) => Promise<{ error: any }>;
  isTeamTracked: (teamId: number) => boolean;
  isPlayerTracked: (playerId: number) => boolean;
  refreshTeams: () => Promise<void>;
  refreshPlayers: () => Promise<void>;
}

const TrackingContext = createContext<TrackingContextType | undefined>(
  undefined,
);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [trackedTeams, setTrackedTeams] = useState<TrackedTeam[]>([]);
  const [trackedPlayers, setTrackedPlayers] = useState<TrackedPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  // Stable ref — avoids re-creating the client on every render and keeps
  // useCallback / useEffect dependency arrays stable.
  const supabaseRef = useRef<SupabaseClient>(createClient());
  const supabase = supabaseRef.current;

  const loadTrackedTeams = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("tracked_teams")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setTrackedTeams(data);
        }
      } catch (err) {
        console.error("Error loading tracked teams:", err);
      }
    },
    [supabase],
  );

  const loadTrackedPlayers = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("tracked_players")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setTrackedPlayers(data);
        }
      } catch (err) {
        console.error("Error loading tracked players:", err);
      }
    },
    [supabase],
  );

  useEffect(() => {
    let mounted = true;

    // Safety: guarantee loading becomes false within 5 s even if
    // Supabase is completely unreachable.
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    // Get the initial session first, then listen for changes.
    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Mark loading done as soon as we know the auth state.
        // Tracked-data fetching happens in the background so the UI
        // isn't held hostage by Supabase table queries timing out.
        setLoading(false);

        if (currentUser) {
          // Fire-and-forget: loads tracked data without blocking the UI.
          Promise.all([
            loadTrackedTeams(currentUser.id),
            loadTrackedPlayers(currentUser.id),
          ]).catch((err) => console.error("Error loading tracked data:", err));
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        if (mounted) setLoading(false);
      }
    };

    initialize();

    // Listen for subsequent auth changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;
        // Skip the initial session event — we already handled it above
        if (event === "INITIAL_SESSION") return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await Promise.all([
            loadTrackedTeams(currentUser.id),
            loadTrackedPlayers(currentUser.id),
          ]);
        } else {
          setTrackedTeams([]);
          setTrackedPlayers([]);
        }
      },
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [supabase, loadTrackedTeams, loadTrackedPlayers]);

  const trackTeam = useCallback(
    async (teamId: number, teamName: string, teamAbbreviation: string) => {
      if (!user) return { data: null, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("tracked_teams")
        .insert({
          user_id: user.id,
          team_id: teamId,
          team_name: teamName,
          team_abbreviation: teamAbbreviation,
        })
        .select()
        .single();

      if (!error && data) {
        setTrackedTeams((prev) => [data, ...prev]);
      }
      return { data, error };
    },
    [user, supabase],
  );

  const untrackTeam = useCallback(
    async (teamId: number) => {
      if (!user) return { error: "Not authenticated" };

      const { error } = await supabase
        .from("tracked_teams")
        .delete()
        .eq("user_id", user.id)
        .eq("team_id", teamId);

      if (!error) {
        setTrackedTeams((prev) => prev.filter((t) => t.team_id !== teamId));
      }
      return { error };
    },
    [user, supabase],
  );

  const trackPlayer = useCallback(
    async (playerId: number, playerName: string, teamAbbreviation: string) => {
      if (!user) return { data: null, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("tracked_players")
        .insert({
          user_id: user.id,
          player_id: playerId,
          player_name: playerName,
          team_abbreviation: teamAbbreviation,
        })
        .select()
        .single();

      if (!error && data) {
        setTrackedPlayers((prev) => [data, ...prev]);
      }
      return { data, error };
    },
    [user, supabase],
  );

  const untrackPlayer = useCallback(
    async (playerId: number) => {
      if (!user) return { error: "Not authenticated" };

      const { error } = await supabase
        .from("tracked_players")
        .delete()
        .eq("user_id", user.id)
        .eq("player_id", playerId);

      if (!error) {
        setTrackedPlayers((prev) =>
          prev.filter((p) => p.player_id !== playerId),
        );
      }
      return { error };
    },
    [user, supabase],
  );

  const isTeamTracked = useCallback(
    (teamId: number) => trackedTeams.some((t) => t.team_id === teamId),
    [trackedTeams],
  );

  const isPlayerTracked = useCallback(
    (playerId: number) => trackedPlayers.some((p) => p.player_id === playerId),
    [trackedPlayers],
  );

  const value = {
    user,
    trackedTeams,
    trackedPlayers,
    loading,
    trackTeam,
    untrackTeam,
    trackPlayer,
    untrackPlayer,
    isTeamTracked,
    isPlayerTracked,
    refreshTeams: async () => {
      if (user) await loadTrackedTeams(user.id);
    },
    refreshPlayers: async () => {
      if (user) await loadTrackedPlayers(user.id);
    },
  };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error("useTracking must be used within a TrackingProvider");
  }
  return context;
}
