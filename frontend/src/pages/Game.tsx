import { useEffect, useState } from "react";
import { QuestionCard } from "../components/QuestionCard";
import { ProgressWord } from "../components/ProgressWord";
import { useGame } from "../hooks/useGame";
import { submitAnswer } from "../services/gameService";
import { supabase } from "../lib/supabase";
import type { Team } from "../types/database";
import { Button } from "@heroui/react";
import UploadField from "../components/UploadField";

export default function Game({ team }: { team: Team }) {
  const { teamQuestion, reload, loading } = useGame(team.id);
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

  if (loading) return <div>Loading...</div>;

  if (!teamQuestion) {
    return (
      <div style={{ padding: 20 }}>
        <h2 className="text-xl font-semibold mb-4">All questions completed — progress</h2>
        <ProgressWord progress={liveTeam.progress} />
        <div className="mt-4">
          {liveTeam.escaped ? (
            <div>
              <p>Team has uploaded escape photo.</p>
              {/** show image if available */}
              {liveTeam.escaped_image && (
                <img src={liveTeam.escaped_image} alt="Escape proof" className="mt-2 max-w-xs" />
              )}
            </div>
          ) : (
            <div>
              <p className="mb-2">Upload a photo to prove your escape:</p>
              <UploadField teamId={team.id} teamName={team.name} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const question = teamQuestion.questions;

  const handleSubmit = async (answer: string) => {
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

      setFeedback({
        message: question.answer,
        explanation: question.answer_description,
        isCorrect: result.correct,
      });
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