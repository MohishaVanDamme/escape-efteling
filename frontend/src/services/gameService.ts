import { supabase } from "../lib/supabase";
import type { TeamQuestion } from "../types/database";
import { RealmEnum } from "../types/realm";

const REGION_ORDER = [
  RealmEnum.ANDERRIJK,
  RealmEnum.RUIGRIJK,
  RealmEnum.REIZENRIJK,
  RealmEnum.MARERIJK,
  RealmEnum.SPROOKJESBOS,
  RealmEnum.FANTASIERIJK,
];

const shuffleArray = <T,>(array: T[]) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const assignTeamQuestionsFromRegion = async (
  teamId: string,
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

  const regionCounts: Record<RealmEnum, number> = REGION_ORDER.reduce(
    (acc, regionName) => {
      acc[regionName] = 0;
      return acc;
    },
    {} as Record<RealmEnum, number>
  );

  if (desiredCount < REGION_ORDER.length) {
    for (let i = 0; i < desiredCount; i += 1) {
      regionCounts[REGION_ORDER[i]] += 1;
    }
  } else {
    regionCounts[RealmEnum.SPROOKJESBOS] = 1;
    const remainingCount = desiredCount - 1;
    const otherRegions = REGION_ORDER.filter(
      (regionName) => regionName !== RealmEnum.SPROOKJESBOS
    );
    const baseCount = Math.floor(remainingCount / otherRegions.length);
    const remainder = remainingCount % otherRegions.length;

    otherRegions.forEach((regionName, index) => {
      regionCounts[regionName] = baseCount + (index < remainder ? 1 : 0);
    });
  }

  const questionsByRegion: Record<RealmEnum, { id: string; level: number }[]> = REGION_ORDER.reduce(
    (acc, regionName) => {
      acc[regionName] = [];
      return acc;
    },
    {} as Record<RealmEnum, { id: string; level: number }[]>
  );

  for (const regionName of REGION_ORDER) {
    const count = regionCounts[regionName];
    if (count <= 0) continue;

    const { data, error } = await supabase
      .from("questions")
      .select("id, level")
      .eq("region", regionName)
      .order("id", { ascending: true });

    if (error) throw error;
    if (!data || data.length < count) {
      throw new Error(`Not enough questions available for region ${regionName}`);
    }

    questionsByRegion[regionName] = data;
  }

  const selectedQuestionsByRegion: Record<RealmEnum, string[]> = REGION_ORDER.reduce(
    (acc, regionName) => {
      acc[regionName] = [];
      return acc;
    },
    {} as Record<RealmEnum, string[]>
  );

  for (const regionName of REGION_ORDER) {
    const count = regionCounts[regionName];
    if (count <= 0) continue;

    const available = questionsByRegion[regionName] ?? [];
    const levels = Array.from(new Set(available.map((question) => question.level))).sort((a, b) => a - b);
    const levelCounts: Record<number, number> = levels.reduce((acc, level, index) => {
      acc[level] = Math.floor(count / levels.length) + (index < count % levels.length ? 1 : 0);
      return acc;
    }, {} as Record<number, number>);

    const availableByLevel = levels.reduce((acc, level) => {
      acc[level] = shuffleArray(available.filter((question) => question.level === level)).map((item) => item.id);
      return acc;
    }, {} as Record<number, string[]>);

    const selected: string[] = [];
    for (const level of levels) {
      const levelQuestionIds = availableByLevel[level] ?? [];
      const levelCount = Math.min(levelCounts[level], levelQuestionIds.length);
      selected.push(...levelQuestionIds.slice(0, levelCount));
    }

    if (selected.length < count) {
      const leftovers = shuffleArray(available)
        .map((item) => item.id)
        .filter((id) => !selected.includes(id));
      selected.push(...leftovers.slice(0, count - selected.length));
    }

    selectedQuestionsByRegion[regionName] = selected;
  }

  const inserts: Array<{ team_id: string; question_id: string; order_index: number }> = [];
  let orderIndex = 0;

  for (const regionName of REGION_ORDER) {
    for (const questionId of selectedQuestionsByRegion[regionName]) {
      inserts.push({
        team_id: teamId,
        question_id: questionId,
        order_index: orderIndex,
      });
      orderIndex += 1;
    }
  }

  await supabase.from("team_questions").insert(inserts);
};

const STOP_WORDS = [
  "de",
  "het",
  "een",
  "den",
  "der",
  "en",
  "van",
  "op",
  "in",
  "te",
  "uit",
  "aan",
  "voor",
  "met",
  "zonder",
  "over",
  "onder",
  "bij",
  "tot",
  "door",
];

export const normalizeAnswerText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !STOP_WORDS.includes(word))
    .sort()
    .join(" ");

export const isAnswerCorrect = (submitted: string, correct: string) => {
  const normalizedSubmitted = normalizeAnswerText(submitted);
  const normalizedCorrect = normalizeAnswerText(correct);
  return normalizedSubmitted === normalizedCorrect;
};

export const submitAnswer = async (
  teamId: string,
  teamQuestion: TeamQuestion,
  answer: string
) => {
  const correct = isAnswerCorrect(answer, teamQuestion.questions.answer);

  await supabase
    .from("team_questions")
    .update({
      is_correct: correct,
      answered_at: new Date().toISOString(),
    })
    .eq("id", teamQuestion.id);

  await supabase
    .from("teams")
    .update({
      current_question_index: teamQuestion.order_index + 1,
    })
    .eq("id", teamId);

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

export async function useHint(teamId: string) {
    const { data, error } = await supabase
        .from("teams")
        .select("hint_count")
        .eq("id", teamId)
        .single();

    if (error) throw error;

    if (data.hint_count >= 3) {
        throw new Error("Geen hints meer beschikbaar");
    }

    const { error: updateError } = await supabase
        .from("teams")
        .update({ hint_count: data.hint_count + 1 })
        .eq("id", teamId);

    if (updateError) throw updateError;

    return data.hint_count + 1;
}