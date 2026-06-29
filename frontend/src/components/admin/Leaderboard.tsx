import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "@heroui/react";
import { useLeaderboardStore } from "../../stores/useLeaderboardStore";
import type { Team } from "../../types/database";

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

  const totalPages = Math.max(
    1,
    Math.ceil(remainingTeams.length / PAGE_SIZE)
  );

  const pagedTeams = remainingTeams.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-3">🏆 Leaderboard</h2>

      {/* Podium */}
      <div className="flex justify-center items-end gap-6 mt-10 mb-12">
        {top3[1] && (
          <PodiumPlace
            place={2}
            name={top3[1].name}
            className="bg-gray-300 h-32"
          />
        )}

        {top3[0] && (
          <PodiumPlace
            place={1}
            name={top3[0].name}
            className="bg-yellow-400 h-40"
            crown
          />
        )}

        {top3[2] && (
          <PodiumPlace
            place={3}
            name={top3[2].name}
            className="bg-orange-400 h-24"
          />
        )}
      </div>

      {/* Ranking */}
      <AnimatePresence>
        {pagedTeams.map((team, index) => (
          <motion.div
            key={team.id}
            layout
            layoutId={team.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              layout: {
                duration: 0.45,
                type: "spring",
              },
            }}
            className="flex justify-between items-center p-3 border-b bg-white rounded-lg mb-2 shadow"
          >
            <div>
              <p className="font-bold">
                {(page - 1) * PAGE_SIZE + index + 4}. {team.name}
              </p>

              <p className="text-sm text-gray-500">
                ❌ {team.wrong_answers} | 💡 {team.hint_count}
              </p>
            </div>

            <div>
              {team.finished_at ? (
                <span className="text-green-600 font-bold">
                  {getDuration(team)}
                </span>
              ) : (
                <span>Vraag {team.current_question_index}</span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination className="w-full">
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={page === 1}
                onPress={() => setPage(page - 1)}
              >
                <Pagination.PreviousIcon />
                <span>Prev</span>
              </Pagination.Previous>
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.Next
                isDisabled={page === totalPages}
                onPress={() => setPage(page + 1)}
              >
                <span>Next</span>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      </div>
    </div>
  );
}

function PodiumPlace({
  place,
  name,
  className,
  crown = false,
}: {
  place: number;
  name: string;
  className: string;
  crown?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`${className} w-24 md:w-28 rounded-t-xl flex items-center justify-center text-2xl font-bold shadow`}
      >
        {place}
        {crown && " 👑"}
      </div>

      <p className="mt-2 font-bold">{name}</p>
    </div>
  );
}

function getDuration(team: Team) {
  if (!team.finished_at || !team.started_at) return null;

  const seconds = Math.floor(
    (new Date(team.finished_at).getTime() -
      new Date(team.started_at).getTime()) /
    1000
  );

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${m}m ${s}s`;
}