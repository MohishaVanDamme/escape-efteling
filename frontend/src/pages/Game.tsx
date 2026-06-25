import { useEffect, useState } from "react";
import { QuestionCard } from "../components/QuestionCard";
import { ProgressWord } from "../components/ProgressWord";
import { useGame } from "../hooks/useGame";
import { submitAnswer } from "../services/gameService";
import { supabase } from "../lib/supabase";
import type { Team } from "../types/database";
import { Button } from "@heroui/react";

export default function Game({ team }: { team: Team }) {
  const { teamQuestion, reload } = useGame(team.id);
  const [liveTeam, setLiveTeam] = useState(team);
  const [feedback, setFeedback] = useState<{ message: string; explanation?: string; isCorrect: boolean } | undefined>(undefined);

  useEffect(() => {
    const channel = supabase
      .channel(`team-progress-${team.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "teams", filter: `id=eq.${team.id}` },
        (payload) => {
          console.log("Realtime team update", payload);
          if (payload.new) {
            setLiveTeam((prev) => ({
              ...prev,
              progress: payload.new.progress ?? prev.progress,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [team.id]);

  if (!teamQuestion) return <div>Loading...</div>;

  const question = teamQuestion.questions;

  const handleSubmit = async (answer: string) => {
    const isCorrect =
      answer.toLowerCase().trim() === question.answer.toLowerCase().trim();

    try {
      const result = await submitAnswer(
        team.id,
        teamQuestion,
        answer
      );

      if (result.correct && result.newProgress) {
        setLiveTeam((prev) => ({
          ...prev,
          progress: result.newProgress,
        }));
      }

      if (isCorrect) {
        setFeedback({ message: question.answer, explanation: question.answer_description, isCorrect: true });
      } else {
        setFeedback({ message: question.answer, explanation: question.answer_description, isCorrect: false });
      }
    } catch (error) {
      console.error("submitAnswer failed", error);
      setFeedback({ message: "Er is iets misgegaan bij het opslaan van je antwoord.", isCorrect: false });
    }
  };

  console.log('Team progress:', team.progress);

  return (
    <div style={{ padding: 20 }}>
      <QuestionCard question={question} onSubmit={handleSubmit} feedback={feedback} />
      {feedback && (
        <Button
          onPress={() => {
            setFeedback(undefined);
            reload();
          }}
        >
          Volgende vraag
        </Button>)}
      <ProgressWord progress={liveTeam.progress} />
    </div>
  );
}