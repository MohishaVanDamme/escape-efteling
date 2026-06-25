import { RealmEnum } from "./realm";

export type Team = {
  id: string;
  name: string;
  started_at: string;
  finished_at: string | null;
  escaped: boolean;
  escaped_image?: string | null;
  current_question_index: number;
  final_word: string;
  progress: string;
};

export type Question = {
  id: string;
  question: string;
  answer: string;
  region: RealmEnum;
  level: number;
  image_url?: string;
  audio_url?: string;
  answer_description?: string;
};

export type TeamQuestion = {
  id: string;
  team_id: string;
  question_id: string;
  order_index: number;
  is_correct: boolean;
  answered_at?: string;
  questions: Question;
};