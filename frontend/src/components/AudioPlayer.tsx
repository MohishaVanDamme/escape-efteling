import { useRef, useState } from "react";

export function AudioPlayer({
    audioUrl,
}: {
    audioUrl: string;
}) {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }

        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleEnded = () => {
        if (!audioRef.current) return;

        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        setIsPlaying(false);
    };

    return (
        <div className="player">
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            {/* Cover + play knop */}
            <div className="cover" onClick={togglePlay}>
                <img src="/EftelingLogo.png" alt="cover" />

                <div className="overlay">
                    <button className="play-btn">
                        {isPlaying ? "⏸" : "▶"}
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <input
                className="progress"
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
            />
        </div>
    );
}