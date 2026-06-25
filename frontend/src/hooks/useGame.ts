import { useEffect, useState } from "react";
import { fetchNextTeamQuestion } from "../services/questionService";
import type { TeamQuestion } from "../types/database";

export const useGame = (teamId: string) => {
  const [teamQuestion, setTeamQuestion] = useState<TeamQuestion | null>(null);

  const load = async (afterOrderIndex?: number) => {
    const q = await fetchNextTeamQuestion(teamId, afterOrderIndex);
    setTeamQuestion(q);
  };

  useEffect(() => {
    if (!teamId) return;
    load();
  }, [teamId]);

  return {
    teamQuestion,
    reload: () => load(teamQuestion?.order_index),
  };
};