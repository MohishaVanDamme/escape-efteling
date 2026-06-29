import { useEffect, useState } from "react";

interface TypewriterProps {
    text: string;
    speed?: number;
    onDone?: () => void;
}

export function Typewriter({ text, speed = 20, onDone }: TypewriterProps) {
    const [displayed, setDisplayed] = useState("");

    // 🔥 strip HTML naar plain text
    const plainText = text.replace(/<[^>]+>/g, "");

    useEffect(() => {
        let current = 0;

        const interval = setInterval(() => {
            setDisplayed(plainText.slice(0, current));
            current++;

            if (current > plainText.length) {
                clearInterval(interval);
                setDisplayed(plainText);
                onDone?.();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [plainText, onDone, speed]);

    return <FormattedText text={displayed} original={text} />;
}

function FormattedText({ text, original }: { text: string; original: string }) {
    const parts = original.split(/(<strong>.*?<\/strong>)/g);

    return (
        <p style={{ whiteSpace: "pre-line" }}>
            {parts.map((part, i) => {
                const isBold = part.startsWith("<strong>");
                const clean = part.replace(/<[^>]+>/g, "");
                const start = parts
                    .slice(0, i)
                    .reduce((sum, part) => sum + part.replace(/<[^>]+>/g, "").length, 0);
                const slice = text.slice(start, start + clean.length);

                if (!slice) return null;

                return isBold ? <strong key={i}>{slice}</strong> : <span key={i}>{slice}</span>;
            })}
        </p>
    );
}