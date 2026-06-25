import { useState } from 'react';
import { Input, Button, Card } from '@heroui/react';
import { assignTeamQuestionsFromRegion } from '../services/gameService';
import { createTeam } from '../services/teamService';
import type { Team } from '../types/database';

export default function Login({ onStart }: { onStart: (team: Team) => void }) {
    const FINAL_WORD = 'ESCAPE';
    const [teamName, setTeamName] = useState('');

    const handleStart = async () => {
        const team = await createTeam(teamName, FINAL_WORD);

        await assignTeamQuestionsFromRegion(team.id, "Marerijk");

        localStorage.setItem("teamId", team.id);
        onStart(team);
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <Card className="w-full max-w-md p-4">
                <Card.Content className="flex flex-col gap-5">
                    <h1 className="text-xl font-bold text-center">
                        Start je team
                    </h1>
                    <Input
                        min="lg"
                        type="text"
                        name="Team naam"
                        placeholder="Bijv. De Ontsnappers"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    />
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={handleStart}
                        isDisabled={!teamName.trim()}
                        className="w-full"
                    >
                        Start spel
                    </Button>

                </Card.Content>
            </Card>
        </div>
    );
}