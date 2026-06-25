import { useEffect, useState } from "react";
import { fetchNextTeamQuestion } from "../services/questionService";
import type { TeamQuestion } from "../types/database";

export const useGame = (teamId: string) => {
  const [teamQuestion, setTeamQuestion] = useState<TeamQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (afterOrderIndex?: number) => {
    setLoading(true);
    const q = await fetchNextTeamQuestion(teamId, afterOrderIndex);
    setTeamQuestion(q);
    setLoading(false);
  };

  useEffect(() => {
    if (!teamId) return;
    load();
  }, [teamId]);

  return {
    teamQuestion,
    loading,
    reload: () => load(teamQuestion?.order_index),
  };
};