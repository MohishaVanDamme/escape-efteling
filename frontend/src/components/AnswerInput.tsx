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
        <div>
            <Input
                fullWidth
                type="text"
                name="Answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <Button
                size="lg"
                style={{ backgroundColor: buttonColor ? buttonColor : undefined }}
                onClick={handleSubmit}
                isDisabled={!answer.trim()}
                className="w-full"
            >
                Antwoorden
            </Button>
        </div>
    )
}