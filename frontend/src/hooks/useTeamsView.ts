import type { Team } from "../types/database";

export const useTeamsView = (teams: Team[]) => {
  return teams.map((team) => {
    const totalQuestions = team.final_word?.length ?? 0;

    const duration =
      team.finished_at && team.started_at
        ? Math.floor(
            (new Date(team.finished_at).getTime() -
              new Date(team.started_at).getTime()) /
              1000
          )
        : null;

    const progressPercent =
      totalQuestions > 0
        ? Math.round((team.current_question_index / totalQuestions) * 100)
        : 0;

    return {
      ...team,
      totalQuestions,
      duration,
      progressPercent,
    };
  });
};