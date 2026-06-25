import { supabase } from "../lib/supabase";
import type { TeamQuestion } from "../types/database";

export const assignTeamQuestionsFromRegion = async (
  teamId: string,
  region: string
) => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("region", region);

  if (error) throw error;

  if (!data || data.length === 0) return;

  const inserts = data.map((q, index) => ({
    team_id: teamId,
    question_id: q.id,
    order_index: index,
  }));

  await supabase.from("team_questions").insert(inserts);
};

export const submitAnswer = async (
  teamId: string,
  teamQuestion: TeamQuestion,
  answer: string
) => {
  const correct =
    answer.toLowerCase().trim() ===
    teamQuestion.questions.answer.toLowerCase().trim();

  await supabase
    .from("team_questions")
    .update({
      is_correct: correct,
      answered_at: new Date().toISOString(),
    })
    .eq("id", teamQuestion.id);

  console.log(`Answer submitted for team ${teamId}: ${answer} (correct: ${correct})`);

  if (!correct) {
    return { correct: false };
  }

  console.log("Fetching latest team progress from DB");
  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select("progress, final_word")
    .eq("id", teamId)
    .single();

  if (teamError) throw teamError;

  const currentProgress = teamData.progress as string;
  const currentFinalWord = teamData.final_word as string;

  console.log("Current progress from DB:", currentProgress);
  console.log("Final word from DB:", currentFinalWord);

  const arr = currentProgress.split("");
  const emptyIndexes = arr
    .map((letter, idx) => (letter === "_" ? idx : -1))
    .filter((idx) => idx >= 0);

  console.log("Empty progress indexes:", emptyIndexes);

  if (emptyIndexes.length === 0) {
    console.log("No empty indexes left, progress remains unchanged.");
    const newProgress = currentProgress;
    return { correct: true, newProgress };
  }

  const randomIndex =
    emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  const chosenLetter = currentFinalWord[randomIndex];
  console.log(
    `Chosen random progress index: ${randomIndex}, letter: ${chosenLetter}`
  );

  arr[randomIndex] = chosenLetter;

  const newProgress = arr.join("");
  console.log("New progress:", newProgress);

  await supabase
    .from("teams")
    .update({ progress: newProgress })
    .eq("id", teamId);

  return { correct: true, newProgress };
};