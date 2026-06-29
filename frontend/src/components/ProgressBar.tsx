import { Particles } from "./ui/particels";

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative h-9 bg-gray-300 rounded-full overflow-visible">
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div
            className="relative h-full transition-all duration-700"
            style={{
              width: `${percent}%`,
              background: "linear-gradient(to right, #5c091a, #bc2141)",
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
        <img
          src="/Pardoes.png"
          alt="Pardoes"
          className="absolute h-14 w-auto z-20 transition-all duration-700 pointer-events-none select-none"
          style={{
            left: `calc(${percent}% - 24px)`,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </div>)
}