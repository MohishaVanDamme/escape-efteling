import { supabase } from "../lib/supabase";
import type { TeamQuestion } from "../types/database";

export const assignTeamQuestionsFromRegion = async (
  teamId: string,
  region: string
) => {
  // fetch team's final word length and only assign that many questions
  const { data: teamData, error: teamErr } = await supabase
    .from("teams")
    .select("final_word")
    .eq("id", teamId)
    .single();

  if (teamErr) throw teamErr;

  const finalWord: string = teamData?.final_word ?? "";
  const desiredCount = finalWord.length;
  if (desiredCount <= 0) return;

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("region", region)
    .order("id", { ascending: true })
    .limit(desiredCount);

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
  // update progress in DB
  await supabase
    .from("teams")
    .update({ progress: newProgress })
    .eq("id", teamId);

  // check if there are any unanswered team_questions left
  const { data: remaining, error: remainingError } = await supabase
    .from("team_questions")
    .select("id")
    .eq("team_id", teamId)
    .is("answered_at", null);

  if (remainingError) throw remainingError;

  if (!remaining || remaining.length === 0) {
    const finishedAt = new Date().toISOString();
    console.log("No remaining questions — setting finished_at:", finishedAt);
    await supabase
      .from("teams")
      .update({ finished_at: finishedAt })
      .eq("id", teamId);

    return { correct: true, newProgress, finished: true, finishedAt };
  }

  return { correct: true, newProgress };
};