import { useRef, useState } from "react";
import { Particles } from "./ui/particels";
import { PlayFill, PauseFill } from '@gravity-ui/icons';

const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function AudioPlayer({
    audioUrl,
}: {
    audioUrl: string;
}) {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = (event?: React.MouseEvent<HTMLButtonElement>) => {
        event?.stopPropagation();
        event?.preventDefault();

        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            return;
        }

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                setIsPlaying(false);
            });
        }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

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
                preload="metadata"
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onPlay={handlePlay}
                onPause={handlePause}
            />
            <div className="cover">
                <img src="/EftelingLogo.png" alt="cover" />

                <div className="overlay">
                    <button
                        className="play-btn relative z-20 pointer-events-auto"
                        type="button"
                        onClick={togglePlay}
                        onMouseDown={(event) => event.stopPropagation()}
                        onTouchStart={(event) => event.stopPropagation()}
                    >
                        {isPlaying ? <PauseFill /> : <PlayFill />}
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-[#5c091a]">
                <span>{formatTime(currentTime)}</span>
                <div className="relative w-full h-4">
                    <div className="absolute inset-0 rounded-full bg-gray-300 overflow-hidden">
                        <div
                            className="h-full transition-all duration-300 relative"
                            style={{
                                transform: `scaleX(${duration ? currentTime / duration : 0})`,
                                transformOrigin: "left",
                                background: "linear-gradient(to right, #5c091a, #bc2141)"
                            }}
                        >
                            <Particles
                                className="absolute inset-0"
                                quantity={30}
                                ease={80}
                                color="#ffffff"
                                refresh
                            />
                        </div>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                </div>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
    );
}