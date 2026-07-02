import { useEffect } from "react";
import { Card, Chip, Pagination } from "@heroui/react";
import { Puzzle, Bulb, Stopwatch } from '@gravity-ui/icons';
import { ProgressBar } from "../ProgressBar";
import { useTeamsView } from "../../hooks/useTeamsView";
import { useTeamsStore } from "../../stores/useTeamsStore";


export function Teams() {
    const { teams, page, total, setPage, fetchTeams, initRealtime } =
        useTeamsStore();

    const totalPages = Math.ceil(total / 6);

    const enrichedTeams = useTeamsView(teams);

    useEffect(() => {
        fetchTeams();
    }, [page]);

    useEffect(() => {
        initRealtime();
    }, []);

    return (
        <div className="px-5">
            <p className="text-2xl font-bold py-5 text-center text-[#F8F1E7]">
                Teams voortgang
            </p>

            {/* GRID */}
            <div className="grid md:grid-cols-2 gap-4">
                {enrichedTeams.map((team) => (
                    <Card
                        key={team.id}
                        className="w-full items-stretch md:flex-row bg-[#F8F1E7]"
                    >
                        <img
                            className="h-32 w-32 object-cover rounded-lg"
                            src={team.escaped_image || "/EftelingLogo.png"}
                            alt={team.name}
                        />

                        <div className="flex flex-1 flex-col gap-3">
                            <Card.Content>
                                <div className="flex justify-between items-center">
                                    <p className="font-bold">{team.name}</p>

                                    {team.finished_at ? (
                                        <Chip color="success" variant="primary">
                                            <Chip.Label>Klaar</Chip.Label>
                                        </Chip>
                                    ) : (
                                        <Chip color="warning" variant="primary">
                                            <Chip.Label>Bezig</Chip.Label>
                                        </Chip>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 my-4">
                                    <ProgressBar percent={team.progressPercent} />

                                    <div className="basis-48 ml-4">
                                        {team.duration && (
                                            <span className="flex justify-end items-center gap-1">
                                                {formatTime(team.duration)} <Stopwatch />
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <span className="flex items-center gap-1">
                                        <Puzzle /> {team.progress}
                                    </span>

                                    <span className="flex items-center gap-1">
                                        {team.hint_count} <Bulb />
                                    </span>
                                </div>
                            </Card.Content>
                        </div>
                    </Card>
                ))}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center my-6">
                <Pagination className="justify-center">
                    <Pagination.Content>
                        {/* PREVIOUS */}
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


                        {getPageNumbers(page, totalPages).map((p, i) =>
                            p === "ellipsis" ? (
                                <Pagination.Ellipsis key={`e-${i}`} className="text-[#F8F1E7]" />
                            ) : (
                                <Pagination.Link
                                    key={p}
                                    isActive={p === page}
                                    onPress={() => setPage(p)}
                                    className={
                                        p === page
                                            ? "bg-accent text-[#F8F1E7] rounded-2xl"
                                            : "hover:bg-accent-hover text-[#F8F1E7]"
                                    }
                                >
                                    {p}
                                </Pagination.Link>
                            )
                        )}
                        {/* NEXT */}
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

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}u ${m}m ${s} s`;
    return `${m}m ${s} s`;
};

const getPageNumbers = (page: number, totalPages: number) => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 1) return [1];

    pages.push(1);

    if (page > 3) pages.push("ellipsis");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (page < totalPages - 2) pages.push("ellipsis");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
};