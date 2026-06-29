import { Particles } from "./ui/particels";

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative h-9 bg-gray-300 rounded-full">
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700 relative"
            style={{
              width: `${percent}%`,
              background: "linear-gradient(to right, #5c091a, #bc2141)"
            }}
          >
            <Particles
              className="absolute inset-0"
              quantity={40}
              ease={80}
              color="#ffffff"
              refresh
            />
          </div>
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 z-20"
          style={{ left: `calc(${percent}% - 24px)` }}
        >
          <img
            src="/Pardoes.png"
            className="h-14 drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}