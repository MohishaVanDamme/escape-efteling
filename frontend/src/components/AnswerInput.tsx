import { Button, Input } from "@heroui/react";
import { useState } from "react";
import type { KeyboardEvent } from "react";

export function AnswerInput({ onSubmit, buttonColor }: { onSubmit: (answer: string) => void; buttonColor?: string }) {
    const [answer, setAnswer] = useState('');

    const handleSubmit = () => {
        if (!answer.trim()) return;
        onSubmit(answer);
        setAnswer('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <Input
                className="rounded-2xl border border-slate-300 bg-white px-3 py-2 shadow-sm focus-visible:border-slate-400 focus-visible:outline-none focus-visible:ring-0"
                style={{ borderColor: buttonColor ? buttonColor : undefined }}
                fullWidth
                type="text"
                name="Antwoord"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <Button
                size="lg"
                style={{ backgroundColor: buttonColor ? buttonColor : undefined }}
                onClick={handleSubmit}
                isDisabled={!answer.trim()}
                className="w-full rounded-2xl"
            >
                Antwoord versturen
            </Button>
        </div>
    )
}