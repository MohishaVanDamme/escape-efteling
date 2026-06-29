import type { Team } from "../types/database";
import { ProgressWord } from "./ProgressWord";
import UploadField from "./UploadField";

export function EndCard({
    liveTeam,
    team,
    onEscaped,
}: {
    liveTeam: Team;
    team: Team;
    onEscaped: () => void;
}) {
    return (
        <div className="flex flex-col gap-5 p-6 max-w-xl mx-auto text-center">
            <div>
                <p className="text-4xl font-bold text-center pb-4
                    text-[#F8F1E7] 
                    drop-shadow-[0_0_15px_rgba(248,241,231,0.9)] "
                >
                    Proficiat, {team.name}!
                </p>
                <p className="text-black leading-relaxed">
                    Jullie hebben alle opdrachten voltooid...<br />
                    De geheimen ontrafeld...<br />
                    En de letters verzameld.
                    <br /><br />
                    Maar jullie zijn er nog niet helemaal...
                </p>
            </div>
            <div className="bg-[#F8F1E7] p-4 rounded-xl shadow">
                <p className="text-black text-lg font-semibold">
                    🔐 Laatste stap
                </p>
                <p className="text-black">
                    Ga naar de eindlocatie en kraak de code.<br />
                    Alleen dan kunnen jullie écht ontsnappen.
                </p>
            </div>
            <div>
                <p className="text-black font-semibold pb-2">
                    Jullie verzamelde letters:
                </p>
                <ProgressWord progress={liveTeam.progress} />
            </div>
            <div className="bg-[#F8F1E7] p-4 rounded-xl shadow mt-4">
                <p className="text-black text-xl font-semibold">
                    📸 Bewijs jullie ontsnapping
                </p>
                <p className="text-black mb-3">
                    Maak een foto met wat jullie in de kist hebben gevonden.
                </p>
                <UploadField
                    teamId={team.id}
                    teamName={team.name}
                    onSuccess={onEscaped}
                />
            </div>
        </div>
    );
}