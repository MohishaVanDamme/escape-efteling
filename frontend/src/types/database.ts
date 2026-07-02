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
  hint_count: number;
  wrong_answers: number;
};

export type Question = {
  id: string;
  question: string;
  region: RealmEnum;
  level: number;
  image_url?: string;
  audio_url?: string;
  answer: string;
  answer_type: string;
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

export type Hint = {
  id: string;
  question_id: string;
  type: 'text' | 'image' | 'audio'
  content: string
}

export type Feedback = {
  message: string;
  type: string;
  explanation?: string;
  isCorrect: boolean
}