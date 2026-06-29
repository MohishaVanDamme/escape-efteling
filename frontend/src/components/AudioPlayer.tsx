import { useRef, useState } from "react";
import { Particles } from "./ui/particels";
import { PlayFill, PauseFill } from '@gravity-ui/icons';

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
            <div className="cover" onClick={togglePlay}>
                <img src="/EftelingLogo.png" alt="cover" />

                <div className="overlay">
                    <button className="play-btn">
                        {isPlaying ? <PauseFill /> : <PlayFill />}
                    </button>
                </div>
            </div>
            <div className="relative w-full h-4 mt-3">
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
        </div>
    );
}