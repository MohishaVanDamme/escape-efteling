import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import React, { useCallback, useEffect, useState } from "react";
import { checkTeamNameExists, createTeam } from "../services/teamService";
import { assignTeamQuestionsFromRegion } from "../services/gameService";
import type { Team } from "../types/database";
import { speak } from "../utils/speakFunction";
import { Typewriter } from "../components/Typewriter";
import { scenes } from "../types/sceens";

export default function Login({ onStart }: { onStart: (team: Team) => void }) {
    const FINAL_WORD = 'FATA MORGANA';
    const [teamName, setTeamName] = useState(() => {
        if (typeof window === "undefined") return '';
        return localStorage.getItem('teamName') ?? '';
    });
    const [teamNameError, setTeamNameError] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(() => {
        if (typeof window === 'undefined') return 0;

        const introFinished = localStorage.getItem('introFinished');
        if (introFinished === 'true') {
            return scenes.length;
        }

        const savedStep = localStorage.getItem('introStep');
        return savedStep ? Number(savedStep) : 0;
    });
    const [fade, setFade] = useState(true);
    const [isTypingDone, setIsTypingDone] = useState(false);
    const handleTypingDone = useCallback(() => setIsTypingDone(true), []);

    // 🔄 Load progress
    useEffect(() => {
        const started = localStorage.getItem('gameStarted');

        if (started === 'true') {
            window.location.href = '/game';
        }
    }, []);

    // 💾 Save progress
    useEffect(() => {
        localStorage.setItem("introStep", String(step));
    }, [step]);

    useEffect(() => {
        localStorage.setItem("teamName", teamName);
    }, [teamName]);

    // 🔊 Speak bij elke scene
    useEffect(() => {
        if (scenes[step]) {
            speak(scenes[step].speech);
        }
    }, [step]);

    function nextStep() {
        window.speechSynthesis.cancel();

        const next = step + 1;
        localStorage.setItem('introStep', String(next));
        if (next >= scenes.length) {
            // 🔥 intro is klaar
            localStorage.setItem('introFinished', 'true');
        }

        setFade(false);
        setTimeout(() => {
            setIsTypingDone(false);
            setStep(next);
            setFade(true);
        }, 300);
    }

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
            window.speechSynthesis.cancel();
            onStart(team);
        } catch {
            setTeamNameError('Er ging iets mis bij het aanmaken van het team.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerStyle: React.CSSProperties = {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "gray",
    };

    const cardStyle: React.CSSProperties = {
        background: "#F8F1E7",
        padding: "24px",
        borderRadius: "16px",
        maxWidth: "420px",
        width: "100%",
        transition: "all 0.3s ease",
        opacity: fade ? 1 : 0,
        transform: fade ? "translateY(0)" : "translateY(20px)",
    };

    const buttonStyle: React.CSSProperties = {
        marginTop: "20px",
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        fontWeight: "bold",
        cursor: "pointer",
        opacity: isTypingDone ? 1 : 0.5,
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {step < scenes.length ? (
                    <>
                        <Typewriter
                            text={scenes[step].display}
                            onDone={handleTypingDone}
                        />

                        <Button
                            style={buttonStyle}
                            onPress={nextStep}
                            isDisabled={!isTypingDone}
                        >
                            Verder →
                        </Button>
                    </>
                ) : (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-center">Start jullie avontuur</h2>
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
                            onClick={() => void handleStart()}
                            isDisabled={isSubmitting}
                            className="w-full"
                        >
                            Start
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}