import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Team } from "../types/database";

const PAGE_SIZE = 6;

type State = {
  teams: Team[];
  page: number;
  total: number;

  setPage: (p: number) => void;
  fetchTeams: () => Promise<void>;
  initRealtime: () => void;
};

let channel: RealtimeChannel | null = null;

export const useTeamsStore = create<State>((set, get) => ({
  teams: [],
  page: 1,
  total: 0,

  setPage: (page) => set({ page }),

  fetchTeams: async () => {

    const { page } = get();

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count } = await supabase
        .from("teams")
        .select("*", { count: "exact" })
        .order("started_at", { ascending: false })
        .range(from, to);

    set({
        teams: data ?? [],
        total: count ?? 0,
    });
    },

    initRealtime: () => {
    console.log("initRealtime");
    if (channel) return;

    channel = supabase
        .channel("teams-live")
        .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        (payload) => {
            console.log(payload)
            const updated = payload.new as Team;

            set((state) => {
            const index = state.teams.findIndex(
                (t) => t.id === updated.id
            );

            if (index === -1) return state;

            const newTeams = [...state.teams];
            newTeams[index] = {
                ...newTeams[index],
                ...updated,
            };

            return { teams: newTeams };
            });
        }
        )
        .subscribe();
    },
}));