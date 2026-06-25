export function ProgressWord({ progress }: { progress: string }) {
    const totalLetters = progress.length;
    const filledLetters = progress.replace(/_/g, "").length;

    return (
        <div className="mb-6 p-4 rounded-3xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                <span>Voortgang woord</span>
                <span>{filledLetters}/{totalLetters} letters ingevuld</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {progress.split("").map((letter, index) => (
                    <div
                        key={index}
                        className={`h-14 w-14 flex items-center justify-center rounded-2xl border text-xl font-semibold transition ${letter === "_"
                                ? "border-dashed border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                                : "border-slate-300 bg-white text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                            }`}
                    >
                        {letter === "_" ? "?" : letter.toUpperCase()}
                    </div>
                ))}
            </div>
        </div>
    );
}
