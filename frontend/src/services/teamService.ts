import { supabase } from "../lib/supabase";
import type { Team } from "../types/database";
import { fetchSecretWord } from "./wordService";

export const checkTeamNameExists = async (name: string) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return false;
  }

  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .ilike("name", trimmedName)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
};

export const createTeam = async (name: string) => {
  const finalWord = await fetchSecretWord();
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Team name is required");
  }

  const teamNameExists = await checkTeamNameExists(trimmedName);

  if (teamNameExists) {
    throw new Error("Team name already exists");
  }

  const progress = "_".repeat(finalWord.length);

  const { data, error } = await supabase
    .from("teams")
    .insert([
      {
        name: trimmedName,
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