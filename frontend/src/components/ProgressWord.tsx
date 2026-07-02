import { useEffect, useRef, useState } from "react";

type CellState = "idle" | "flying" | "opening" | "revealed";

export function ProgressWord({ progress }: { progress: string }) {
    const previousProgressRef = useRef(progress);

    const [cellStates, setCellStates] = useState<CellState[]>(
        () => progress.split("").map((c) => (c === "_" ? "idle" : "revealed"))
    );

    const KEY_DURATION = 1200;
    const SLOT_DURATION = 2000;

    useEffect(() => {
        const prev = previousProgressRef.current;

        const updates: { index: number; type: CellState }[] = [];

        progress.split("").forEach((char, i) => {
            if (prev[i] === "_" && char !== "_") {
                updates.push({ index: i, type: "flying" });
            }
        });

        if (updates.length === 0) {
            previousProgressRef.current = progress;
            return;
        }

        previousProgressRef.current = progress;

        updates.forEach(({ index }) => {
            // 1. flying (key animation start)
            setCellStates((prev) => {
                const next = [...prev];
                next[index] = "flying";
                return next;
            });

            // 2. opening
            window.setTimeout(() => {
                setCellStates((prev) => {
                    const next = [...prev];
                    next[index] = "opening";
                    return next;
                });
            }, KEY_DURATION);

            // 3. revealed
            window.setTimeout(() => {
                setCellStates((prev) => {
                    const next = [...prev];
                    next[index] = "revealed";
                    return next;
                });
            }, KEY_DURATION + SLOT_DURATION);
        });
    }, [progress]);

    return (
        <div className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 w-full bg-[#F8F1E7]">
            <div className="mb-3 flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200 text-center">
                Sleutel locatie
            </div>
            <div className="flex flex-wrap gap-2">
                {progress.split("").map((letter, index) => {
                    const state = cellStates[index];
                    const isLocked = letter === "_";

                    const isRevealed = state === "revealed";
                    const isFlying = state === "flying";
                    const isOpening = state === "opening";

                    const showSlot = isLocked || isFlying || isOpening;

                    return (
                        <div
                            key={index}
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-semibold transition ${isRevealed
                                    ? "border-slate-300 bg-white text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                                    : "border-dashed border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                                }`}
                        >
                            {showSlot && !isRevealed ? (
                                <div className="relative flex h-16 w-16 items-center justify-center overflow-visible">
                                    <img
                                        src="/EftelingSlot.png"
                                        alt="Slot"
                                        className="h-16 w-16 object-contain"
                                    />

                                    {isFlying && (
                                        <img
                                            src="/EftelingSleutel.png"
                                            alt="Sleutel"
                                            className="pointer-events-none absolute inset-0 h-14 w-14 object-contain"
                                            style={{
                                                animation: "keyFly 1.2s ease-out forwards",
                                            }}
                                        />
                                    )}

                                    {isOpening && (
                                        <img
                                            src="/EftelingSlotSleutel.png"
                                            alt="Slot geopend"
                                            className="pointer-events-none absolute inset-0 h-16 w-16 object-contain"
                                            style={{
                                                animation: "slotOpen 2s ease-out forwards",
                                            }}
                                        />
                                    )}
                                </div>
                            ) : (
                                letter.toUpperCase()
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes keyFly {
                    0% {
                        opacity: 0;
                        transform: translate(-50vw, -45vh) scale(2.2) rotate(-20deg);
                    }
                    20% {
                        opacity: 0.9;
                        transform: translate(-12vw, -18vh) scale(1.5) rotate(-8deg);
                    }
                    55% {
                        opacity: 1;
                        transform: translate(-1.5vw, -2vh) scale(1.06) rotate(-2deg);
                    }
                    100% {
                        opacity: 0.95;
                        transform: translate(0px, 0px) scale(0.8) rotate(4deg);
                    }
                }

                @keyframes slotOpen {
                    0% {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
}