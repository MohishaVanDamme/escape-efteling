import type { Team } from "../../types/database";

export function getDuration(team: Team) {
    if (!team.finished_at || !team.started_at) return null;

    const seconds = Math.floor(
        (new Date(team.finished_at).getTime() -
            new Date(team.started_at).getTime()) /
        1000
    );

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}u ${m}m ${s} s`;
    return `${m}m ${s} s`;
}

export function getRightAnsweredCount(team: Team) {
    if (!team.final_word) return null;

    const rightAnsweredCount = team.final_word.length - team.wrong_answers;
    return rightAnsweredCount;
}