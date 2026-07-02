import { useEffect } from "react";
import { Pagination } from "@heroui/react";
import { Bulb, Stopwatch, Minus } from '@gravity-ui/icons';
import { useLeaderboardStore } from "../../stores/useLeaderboardStore";
import { PodiumPlace } from "./PodiumPlace";
import { getDuration, getRightAnsweredCount } from "./HelperFunctions";

const PAGE_SIZE = 5;

export function Leaderboard() {
  const {
    teams,
    page,
    setPage,
    fetchLeaderboard,
    initRealtime,
  } = useLeaderboardStore();

  useEffect(() => {
    fetchLeaderboard();
    initRealtime();
  }, []);

  const sortedTeams = [...teams].sort((a, b) => {
    // Beide klaar
    if (a.finished_at && b.finished_at) {
      const durationA =
        new Date(a.finished_at).getTime() -
        new Date(a.started_at).getTime();

      const durationB =
        new Date(b.finished_at).getTime() -
        new Date(b.started_at).getTime();

      if (durationA !== durationB) {
        return durationA - durationB;
      }

      if (a.wrong_answers !== b.wrong_answers) {
        return a.wrong_answers - b.wrong_answers;
      }

      return a.hint_count - b.hint_count;
    }

    // Klaar wint altijd
    if (a.finished_at) return -1;
    if (b.finished_at) return 1;

    // Anders hoogste progress
    return b.current_question_index - a.current_question_index;
  });

  const top3 = sortedTeams.slice(0, 3);
  const remainingTeams = sortedTeams.slice(3);
  const firstPageTeams = remainingTeams.slice(0, 2);
  const extraTeams = remainingTeams.slice(2);

  const totalPages = Math.max(
    1,
    1 + Math.ceil(Math.max(0, extraTeams.length) / PAGE_SIZE)
  );

  const pagedTeams =
    page === 1
      ? firstPageTeams
      : extraTeams.slice(
        (page - 2) * PAGE_SIZE,
        (page - 2) * PAGE_SIZE + PAGE_SIZE
      );

  const getRankNumber = (index: number) => {
    if (page === 1) {
      return 4 + index;
    }

    return 6 + (page - 2) * PAGE_SIZE + index;
  };

  return (
    <div className="px-5">
      <p className="text-2xl font-bold py-5 text-center text-[#F8F1E7]">
        Ranglijst
      </p>

      {page === 1 && (
        <>
          {/* Podium */}
          <div className="flex justify-center items-end gap-6 mb-10">
            {top3[1] && (
              <PodiumPlace
                place={2}
                team={top3[1]}
              />
            )}

            {top3[0] && (
              <PodiumPlace
                place={1}
                team={top3[0]}
              />
            )}

            {top3[2] && (
              <PodiumPlace
                place={3}
                team={top3[2]}
              />
            )}
          </div>
        </>
      )}

      {/* Ranking */}
      {pagedTeams.map((team, index) => (
        <div
          key={team.id}
          className="flex justify-between items-center p-3 border-b border-accent bg-accent rounded-lg mb-2 shadow text-[#F8F1E7]"
        >
          <div>
            <p className="font-bold">
              {getRankNumber(index)}. {team.name}
            </p>

            <p className="text-sm flex flex-row items-center gap-2">
              {getRightAnsweredCount(team)} van de {team.final_word.length} <Minus className="rotate-90" /> {team.hint_count} <Bulb />
            </p>
          </div>

          <div>
            {team.finished_at ? (
              <span className="flex flex-row items-center gap-2">
                <Stopwatch /> {getDuration(team)}
              </span>
            ) : (
              <span>Vraag {team.current_question_index}</span>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination className="w-full">
          <Pagination.Content className="flex justify-between w-full">
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={page === 1}
                onPress={() => setPage(page - 1)}
                className="text-[#F8F1E7] hover:bg-accent-hover"
              >
                <Pagination.PreviousIcon />
                <span>Vorige</span>
              </Pagination.Previous>
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.Next
                isDisabled={page === totalPages}
                onPress={() => setPage(page + 1)}
                className="text-[#F8F1E7] hover:bg-accent-hover"
              >
                <span>Volgende</span>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      </div>
    </div>
  );
}

