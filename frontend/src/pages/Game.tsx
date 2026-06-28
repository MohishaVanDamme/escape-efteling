import { useEffect, useState } from "react";
import { QuestionCard } from "../components/QuestionCard";
import { ProgressWord } from "../components/ProgressWord";
import { useGame } from "../hooks/useGame";
import { submitAnswer } from "../services/gameService";
import { supabase } from "../lib/supabase";
import type { Hint, Team } from "../types/database";
import { Button } from "@heroui/react";
import { EndCard } from "../components/EndCard";
import MissionSuccess from "../components/MissionSuccess";
import { getQuestionWithHints } from "../services/questionService";
import { HintModal } from "../components/HintField";

export default function Game({ team }: { team: Team }) {
  const { teamQuestion, reload, loading } = useGame(team.id);

  const [liveTeam, setLiveTeam] = useState(team);
  const [feedback, setFeedback] = useState<
    { message: string; explanation?: string; isCorrect: boolean } | undefined
  >(undefined);

  const [hint, setHint] = useState<Hint | null>(null);

  const question = teamQuestion?.questions;

  // 🔥 EXTRA: fallback fetch (fix voor jouw probleem)
  const fetchTeam = async () => {
    const { data } = await supabase
      .from("teams")
      .select("*")
      .eq("id", team.id)
      .single();

    if (data) {
      setLiveTeam(data);
    }
  };

  // 🔁 Realtime team updates
  useEffect(() => {
    const channel = supabase
      .channel(`team-progress-${team.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "teams",
          filter: `id=eq.${team.id}`,
        },
        (payload) => {
          if (payload.new) {
            setLiveTeam((prev) => ({
              ...prev,
              progress: payload.new.progress ?? prev.progress,
              escaped: payload.new.escaped ?? prev.escaped,
              escaped_image:
                payload.new.escaped_image ?? prev.escaped_image,
              hint_count: payload.new.hint_count ?? prev.hint_count, // 🔥 belangrijk
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [team.id]);

  // 🔁 Load hint when question changes
  useEffect(() => {
    if (!question?.id) return;

    const loadHint = async () => {
      try {
        const data = await getQuestionWithHints(question.id);
        setHint(data);
      } catch (err) {
        console.error("Failed to load hint:", err);
        setHint(null);
      }
    };

    loadHint();
  }, [question?.id]);

  const handleTeamEscaped = () => {
    setLiveTeam((prev) => ({
      ...prev,
      escaped: true,
    }));
  };

  const handleSubmit = async (answer: string) => {
    if (!teamQuestion || !question) return;

    try {
      const result = await submitAnswer(team.id, teamQuestion, answer);

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
      setFeedback({
        message: "Er is iets misgegaan bij het opslaan van je antwoord.",
        isCorrect: false,
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!teamQuestion || !question) {
    return (
      <div>
        {liveTeam.escaped ? (
          <MissionSuccess team={team} />
        ) : (
          <EndCard
            liveTeam={liveTeam}
            team={team}
            onEscaped={handleTeamEscaped}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="flex flex-row justify-between items-center bg-[#F8F1E7] p-5">
        <p className="text-xl font-bold text-accent">{team.name}</p>

        <HintModal
          hint={hint}
          numberOfHints={3}
          usedHints={liveTeam.hint_count || 0}
          teamId={team.id}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center items-center w-full gap-5 p-5">
        <div className="w-full">
          <QuestionCard
            question={question}
            onSubmit={handleSubmit}
            feedback={feedback}
          />

          {feedback && (
            <div className="w-full flex justify-center mt-2">
              <Button
                onPress={async () => {
                  setFeedback(undefined);

                  await reload();     // nieuwe vraag
                  await fetchTeam();  // 🔥 FIX: force sync team data
                }}
                className="border border-[#842229] text-white rounded-2xl px-4 py-2"
              >
                Volgende vraag
              </Button>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mt-auto">
          <ProgressWord progress={liveTeam.progress} />
        </div>
      </div>
    </div>
  );
}