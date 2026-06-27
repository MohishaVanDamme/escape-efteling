import { useEffect, useState } from "react";
import { QuestionCard } from "../components/QuestionCard";
import { ProgressWord } from "../components/ProgressWord";
import { useGame } from "../hooks/useGame";
import { submitAnswer } from "../services/gameService";
import { supabase } from "../lib/supabase";
import type { Team } from "../types/database";
import { Button } from "@heroui/react";
import { EndCard } from "../components/EndCard";
import MissionSuccess from "../components/MissionSuccess";

export default function Game({ team }: { team: Team }) {
  const { teamQuestion, reload, loading } = useGame(team.id);
  const [liveTeam, setLiveTeam] = useState(team);
  const [feedback, setFeedback] = useState<{ message: string; explanation?: string; isCorrect: boolean } | undefined>(undefined);

  const handleTeamEscaped = () => {
    setLiveTeam((prev) => ({
      ...prev,
      escaped: true,
    }));
  };

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
              escaped: payload.new.escaped ?? prev.escaped,
              escaped_image: payload.new.escaped_image ?? prev.escaped_image,
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
      <div>
        {liveTeam.escaped ? (
          <MissionSuccess team={team} />
        ) : (
          <EndCard liveTeam={liveTeam} team={team} onEscaped={handleTeamEscaped} />
        )
        }
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
    <div className="flex min-h-screen flex-col justify-between gap-5 p-5" style={{ padding: 20 }}>
      <div className="flex-1">
        <QuestionCard question={question} onSubmit={handleSubmit} feedback={feedback} />
        {feedback && (
          <Button
            onPress={() => {
              setFeedback(undefined);
              reload();
            }}
            className="mt-4 border border-[#842229] text-white rounded-2xl px-4 py-2"
          >
            Volgende vraag
          </Button>)}
      </div>

      <div className="mt-auto">
        <ProgressWord progress={liveTeam.progress} />
      </div>
    </div>
  );
}