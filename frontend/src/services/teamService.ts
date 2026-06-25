import { supabase } from "../lib/supabase";
import type { Team } from "../types/database";

export const createTeam = async (name: string, finalWord: string) => {
  const progress = "_".repeat(finalWord.length);

  const { data, error } = await supabase
    .from("teams")
    .insert([
      {
        name,
        final_word: finalWord,
        progress,
        started_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data as Team;
};

export const fetchTeamById = async (teamId: string) => {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  if (error) throw error;

  return data as Team;
};