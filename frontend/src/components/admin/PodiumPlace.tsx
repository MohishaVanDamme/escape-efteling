import type { Team } from "../../types/database";
import { getDuration, getRightAnsweredCount } from "./HelperFunctions";
import { Stopwatch } from '@gravity-ui/icons';

function PodiumPlaceRenderer({ place, team }: { place: number; team:Team }) {
    switch (place) {
        case 1:
            return (
                <div
                    className="bg-accent h-96 w-32 md:w-44 rounded-t-xl flex flex-col items-center justify-start p-3 gap-3"
                >
                    <img src="/GoudMedaille.png" alt="Goud Medaille" className="h-36" />
                    <div>
                        <span className="flex flex-row items-center gap-2">
                            <Stopwatch />{getDuration(team)}
                        </span>
                        <p>{getRightAnsweredCount(team)} van de {team.final_word.length}</p>
                    </div>
                    
                </div>

            )

        case 2:
            return (
                <div
                    className="bg-accent h-80 w-32 md:w-44 rounded-t-xl flex flex-col items-center justify-start p-3 gap-3"
                >
                    <img src="/ZilverMedaille.png" alt="Zilver Medaille" className="h-36" />
                    <div>
                        <span className="flex flex-row items-center gap-2">
                            <Stopwatch />{getDuration(team)}
                        </span>
                        <p>{getRightAnsweredCount(team)} van de {team.final_word.length}</p>
                    </div>
                </div>
            )

        case 3:
            return (
                <div
                    className="bg-accent h-63.75 w-32 md:w-44 rounded-t-xl flex flex-col items-center justify-start p-3 gap-3"
                >
                    <img src="/BronzenMedaille.png" alt="Bronzen Medaille" className="h-36" />
                    <div>
                        <span className="flex flex-row items-center gap-2">
                            <Stopwatch />{getDuration(team)}
                        </span>
                        <p>{getRightAnsweredCount(team)} van de {team.final_word.length}</p>
                    </div>
                </div>
            )

        default:
            return null
    }
}

export function PodiumPlace({
    place,
    team,
}: {
    place: number;
    team: Team;
}) {
    return (
        <div className="text-center text-[#F8F1E7] flex flex-col items-center gap-2">
            <p className="mb-2 font-bold text-lg">{team.name}</p>
            <PodiumPlaceRenderer place={place} team={team} />
        </div>
    );
}