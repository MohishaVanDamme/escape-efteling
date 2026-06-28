import { supabase } from "../lib/supabase";
import type { Hint, TeamQuestion } from "../types/database";

export const fetchNextTeamQuestion = async (
  teamId: string,
  afterOrderIndex?: number
): Promise<TeamQuestion | null> => {
  let query = supabase
    .from("team_questions")
    .select("id, order_index, is_correct, questions(*)")
    .eq("team_id", teamId)
    .is("answered_at", null)
    .order("order_index", { ascending: true })
    .limit(1);

  if (typeof afterOrderIndex === "number") {
    query = query.gt("order_index", afterOrderIndex);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw error;

  return data as TeamQuestion | null;
};

export const getQuestionWithHints = async (
  questionId: string
): Promise<Hint> => {
  const { data, error } = await supabase
    .from('hints')
    .select('*')
    .eq('question_id', questionId)
    .single()

  if (error) throw error
  if (!data) throw new Error("No hint found")

  return data
}