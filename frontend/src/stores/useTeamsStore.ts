import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type {
    RealtimeChannel,
    RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
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
        if (channel) return;

        channel = supabase
            .channel("teams-live")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "teams" },
                (payload: RealtimePostgresChangesPayload<Team>) => {
                    set((state) => {
                        switch (payload.eventType) {
                            case "INSERT": {
                                const newTeam = payload.new;

                                if (state.page !== 1) {
                                    return {
                                        teams: state.teams,
                                        total: state.total + 1,
                                    };
                                }

                                const nextTeams = [newTeam, ...state.teams.filter((team) => team.id !== newTeam.id)]
                                    .slice(0, PAGE_SIZE);

                                return {
                                    teams: nextTeams,
                                    total: state.total + 1,
                                };
                            }

                            case "UPDATE": {
                                const updated = payload.new;
                                const index = state.teams.findIndex((team) => team.id === updated.id);

                                if (index === -1) {
                                    return state;
                                }

                                const nextTeams = [...state.teams];
                                nextTeams[index] = {
                                    ...nextTeams[index],
                                    ...updated,
                                };

                                return { teams: nextTeams };
                            }

                            case "DELETE": {
                                const deletedId = payload.old.id;
                                return {
                                    teams: state.teams.filter((team) => team.id !== deletedId),
                                    total: Math.max(0, state.total - 1),
                                };
                            }

                            default:
                                return state;
                        }
                    });
                }
            )
            .subscribe();
    },
}));