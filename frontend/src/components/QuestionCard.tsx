import type { Question } from "../types/database";
import { getRealm } from "../types/realm";
import { AnswerInput } from "./AnswerInput";
import { AudioPlayer } from "./AudioPlayer";
import { Card } from "@heroui/react";

export function QuestionCard({
    question,
    onSubmit,
    feedback,
}: {
    question: Question;
    onSubmit: (answer: string) => void;
    feedback?: { message: string; explanation?: string; isCorrect: boolean };
}) {
    const realm = getRealm(question.region);
    return (
        <Card className="w-full bg-[#F8F1E7]">
            {question.audio_url && (
                <AudioPlayer audioUrl={question.audio_url} />
            )}
            {question.image_url && (
                <img
                    className="max-h-80 w-auto object-contain"
                    src={question.image_url}
                    alt="Question image"
                />

            )}
            <Card.Header>
                <Card.Title>{question.question}</Card.Title>
            </Card.Header>
            <Card.Content>
                {feedback && (
                    <div className={`border p-4 rounded ${feedback.isCorrect ? "border-green-500" : "border-red-500"}`}>
                        <p>{feedback.message}</p>
                        {feedback.explanation && <p>{feedback.explanation}</p>}
                    </div>
                )}
                {!feedback && (
                    <AnswerInput
                        onSubmit={onSubmit}
                        buttonColor={realm.color}
                    />
                )}
            </Card.Content>
        </Card>
    );
}