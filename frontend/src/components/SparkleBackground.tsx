import { useMemo } from 'react';

interface SparkleBackgroundProps {
    backgroundColor?: string;
    sparkleColor?: string;
    sparkleCount?: number;
    className?: string;
}

interface Sparkle {
    id: number;
    left: string;
    top: string;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
}

export default function SparkleBackground({
    backgroundColor = '#F8F1E7',
    sparkleColor = '#ffffff',
    sparkleCount = 90,
    className = '',
}: SparkleBackgroundProps) {
    const sparkles = useMemo<Sparkle[]>(() => {
        return Array.from({ length: sparkleCount }, (_, index) => ({
            id: index,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: Math.random() * 2.4 + 1,
            duration: Math.random() * 3.2 + 2.4,
            delay: Math.random() * 3.5,
            opacity: Math.random() * 0.7 + 0.25,
        }));
    }, [sparkleCount]);

    return (
        <div
            className={`absolute inset-0 overflow-hidden ${className}`.trim()}
            style={{ backgroundColor }}
            aria-hidden="true"
        >
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(circle at top, rgba(255,255,255,0.16), transparent 55%)`,
                }}
            />

            {sparkles.map((sparkle) => (
                <span
                    key={sparkle.id}
                    className="pointer-events-none absolute block rounded-full"
                    style={{
                        left: sparkle.left,
                        top: sparkle.top,
                        width: sparkle.size,
                        height: sparkle.size,
                        backgroundColor: sparkleColor,
                        opacity: sparkle.opacity,
                        boxShadow: `0 0 ${sparkle.size * 2.2}px ${sparkle.size * 0.8}px ${sparkleColor}`,
                        animation: `sparkle ${sparkle.duration}s ease-in-out ${sparkle.delay}s infinite`,
                    }}
                />
            ))}

            <style>{`
        @keyframes sparkle {
          0%, 100% {
            transform: scale(0.7);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}
