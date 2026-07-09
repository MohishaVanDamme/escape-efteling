import { useEffect, useState } from "react";
import { QuestionCard } from "../components/QuestionCard";
import { ProgressWord } from "../components/ProgressWord";
import { useGame } from "../hooks/useGame";
import { submitAnswer } from "../services/gameService";
import { supabase } from "../lib/supabase";
import type { Feedback, Hint, Team } from "../types/database";
import { Button, Spinner, toast } from "@heroui/react";
import { EndCard } from "../components/EndCard";
import MissionSuccess from "../components/MissionSuccess";
import { getQuestionWithHints, getTotalQuestionsForTeam } from "../services/questionService";
import { HintModal } from "../components/HintField";
import { ProgressBar } from "../components/ProgressBar";

export default function Game({ team }: { team: Team }) {
  const { teamQuestion, reload, loading } = useGame(team.id);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [liveTeam, setLiveTeam] = useState(team);
  const [hint, setHint] = useState<Hint | null>(null);
  const [feedback, setFeedback] = useState<Feedback | undefined>(undefined);
  const [showEndCard, setShowEndCard] = useState(false);
  const [finishedAfterSubmit, setFinishedAfterSubmit] = useState(false);

  const question = teamQuestion?.questions;

  const hasRenderableQuestion = Boolean(question?.id && question?.question && question?.answer);
  const progressPercent =
    totalQuestions > 0
      ? Math.round((liveTeam.current_question_index / totalQuestions) * 100)
      : 0;

  useEffect(() => {
    const loadTotal = async () => {
      const total = await getTotalQuestionsForTeam(team.id);
      setTotalQuestions(total);
    };

    loadTotal();
  }, [team.id]);


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
              current_question_index:
                payload.new.current_question_index ?? prev.current_question_index,
              progress: payload.new.progress ?? prev.progress,
              escaped: payload.new.escaped ?? prev.escaped,
              escaped_image:
                payload.new.escaped_image ?? prev.escaped_image,
              hint_count: payload.new.hint_count ?? prev.hint_count,
              wrong_answers: payload.new.wrong_answers ?? prev.wrong_answers,
              finished_at: payload.new.finished_at ?? prev.finished_at,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [team.id]);

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

      setLiveTeam((prev) => ({
        ...prev,
        current_question_index: teamQuestion.order_index + 1,
        progress: result.correct && result.newProgress ? result.newProgress : prev.progress,
        wrong_answers: result.correct ? prev.wrong_answers : prev.wrong_answers + 1,
      }));

      setFinishedAfterSubmit(Boolean(result.finished));
      setShowEndCard(false);

      setFeedback({
        message: question.answer,
        type: question.answer_type,
        explanation: question.answer_description,
        isCorrect: result.correct,
      });
    } catch (error) {
      console.error("submitAnswer is mislukt", error);
      toast.danger("Er is iets misgegaan bij het opslaan van je antwoord.")
    }
  };

  if (loading) return <Spinner size="xl" />;

  if (!hasRenderableQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (showEndCard || (liveTeam.finished_at && !feedback && !teamQuestion)) {
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
      <div className="flex flex-row justify-between items-center bg-[#F8F1E7] p-5 gap-2">
        <ProgressBar percent={progressPercent} />

        <HintModal
          hint={hint}
          numberOfHints={3}
          usedHints={liveTeam.hint_count || 0}
          teamId={team.id}
        />
      </div>

      <div className="flex flex-1 flex-col justify-center items-center w-full gap-5 p-5">
        <div className="w-full">
          {question && (
            <QuestionCard
              question={question}
              onSubmit={handleSubmit}
              feedback={feedback}
            />
          )}

          {feedback && (
            <div className="w-full flex justify-center mt-2">
              <Button
                onPress={async () => {
                  if (finishedAfterSubmit) {
                    setFeedback(undefined);
                    setShowEndCard(true);
                    await fetchTeam();
                    return;
                  }

                  setFeedback(undefined);
                  await reload();
                  await fetchTeam();
                }}
                className="border border-[#842229] text-white rounded-2xl px-4 py-2"
              >
                {finishedAfterSubmit ? "Naar eindkaart" : "Volgende vraag"}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <ProgressWord progress={liveTeam.progress} />
        </div>
      </div>
    </div>
  );
}