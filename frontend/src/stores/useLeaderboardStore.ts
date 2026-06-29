import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import type { Team } from "../types/database";

type State = {
  teams: Team[];
  page: number;

  setPage: (page: number) => void;

  fetchLeaderboard: () => Promise<void>;
  initRealtime: () => void;
};

let channel: RealtimeChannel | null = null;

export const useLeaderboardStore = create<State>((set) => ({
  teams: [],
  page: 1,

  setPage: (page) => set({ page }),

  fetchLeaderboard: async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    set({
      teams: data ?? [],
    });
  },

  initRealtime: () => {
    if (channel) return;

    channel = supabase
      .channel("leaderboard-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
        },
        (payload: RealtimePostgresChangesPayload<Team>) => {
          set((state) => {
            switch (payload.eventType) {
              case "INSERT":
                return {
                  teams: [...state.teams, payload.new],
                };

              case "UPDATE":
                return {
                  teams: state.teams.map((team) =>
                    team.id === payload.new.id
                      ? { ...team, ...payload.new }
                      : team
                  ),
                };

              case "DELETE":
                return {
                  teams: state.teams.filter(
                    (team) => team.id !== payload.old.id
                  ),
                };

              default:
                return state;
            }
          });
        }
      )
      .subscribe((status) => {
        console.log("Leaderboard:", status);
      });
  },
}));