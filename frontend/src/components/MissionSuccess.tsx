import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {StarFill} from '@gravity-ui/icons';

type Props = {
  team: {
    name: string;
  };
};

export default function MissionSuccess({ team }: Props) {
  const logoRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const confettiInstance = (confetti as any).create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    // 🎉 Confetti vanuit logo
    let origin = { x: 0.5, y: 0.2 };

    if (logoRef.current) {
      const rect = logoRef.current.getBoundingClientRect();
      origin = {
        x: clamp((rect.left + rect.width / 2) / window.innerWidth, 0.08, 0.92),
        y: clamp((rect.top + rect.height / 2) / window.innerHeight, 0.08, 0.92),
      };

      confettiInstance({
        particleCount: 140,
        spread: 360,
        startVelocity: 35,
        gravity: 0.5,
        ticks: 120,
        scalar: 0.9,
        origin,
      });
    }

    // ✨ Magic sparkles (blijft doorgaan vanaf het logo)
    const interval = setInterval(() => {
      confettiInstance({
        particleCount: 18,
        spread: 360,
        startVelocity: 24,
        ticks: 100,
        gravity: 0.45,
        scalar: 0.85,
        origin,
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-6 text-center animate-pop">

        <img
          ref={logoRef}
          className="w-40 h-40 rounded-full shadow-xl animate-glow"
          src="/EftelingLogo.png"
          alt="Efteling logo"
        />

        <p className="text-5xl md:text-7xl font-extrabold text-white">
          MISSIE GESLAAGD!
        </p>

        <div className="flex flex-row items-center justify-center gap-3 text-2xl text-[#B71234]">
          <StarFill className="inline-block w-6 h-6" />
          <p className="border border-[#B71234] bg-[#5c091a] p-2"><strong>{team.name}</strong> is ontsnapt!</p>
          <StarFill className="inline-block w-6 h-6" />
        </div>

      </div>
    </div>
  );
}