import { useState } from 'react';
import { Input, Button, Card, TextField, Label, FieldError } from '@heroui/react';
import { assignTeamQuestionsFromRegion } from '../services/gameService';
import { checkTeamNameExists, createTeam } from '../services/teamService';
import type { Team } from '../types/database';

export default function Login({ onStart }: { onStart: (team: Team) => void }) {
    const FINAL_WORD = 'FATA MORGANA';
    const [teamName, setTeamName] = useState('');
    const [teamNameError, setTeamNameError] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateTeamName = async () => {
        const trimmedName = teamName.trim();

        if (!trimmedName) {
            setTeamNameError('Je moet een teamnaam invoeren');
            return false;
        }

        try {
            const teamNameExists = await checkTeamNameExists(trimmedName);

            if (teamNameExists) {
                setTeamNameError('Deze teamnaam bestaat al. Kies een andere naam.');
                return false;
            }

            setTeamNameError('');
            return true;
        } catch {
            setTeamNameError('Er ging iets mis bij het controleren van de teamnaam.');
            return false;
        }
    };

    const handleStart = async () => {
        setHasSubmitted(true);

        const isValid = await validateTeamName();

        if (!isValid) {
            return;
        }

        setIsSubmitting(true);

        try {
            const team = await createTeam(teamName, FINAL_WORD);

            await assignTeamQuestionsFromRegion(team.id);

            localStorage.setItem("teamId", team.id);
            onStart(team);
        } catch {
            setTeamNameError('Er ging iets mis bij het aanmaken van het team.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <Card className="w-full max-w-md border border-white/30 p-4 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur-xl" style={{ backgroundColor: '#F8F1E7' }}>
                <Card.Content className="flex flex-col gap-5">
                    <img src="/EftelingEscape.PNG" alt="Efteling escape" className="mx-auto" />
                    <TextField
                        isInvalid={hasSubmitted && (!teamName.trim() || !!teamNameError)}
                    >
                        <Label>Team naam</Label>
                        <Input
                            type="text"
                            name="Team naam"
                            placeholder="Bijv. De Ontsnappers"
                            value={teamName}
                            onChange={(e) => {
                                setTeamName(e.target.value);
                                if (teamNameError) {
                                    setTeamNameError('');
                                }
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && void handleStart()}
                        />
                        {teamNameError || (hasSubmitted && !teamName.trim()) ? (
                            <FieldError>{teamNameError || 'Je moet een teamnaam invoeren'}</FieldError>
                        ) : null}
                    </TextField>
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => void handleStart()}
                        isDisabled={isSubmitting}
                        className="w-full"
                    >
                        Start
                    </Button>
                </Card.Content>
            </Card>
        </div>
    );
}