declare module "canvas-confetti" {
    interface ConfettiOptions {
        particleCount?: number;
        spread?: number;
        startVelocity?: number;
        gravity?: number;
        ticks?: number;
        scalar?: number;
        origin?: { x?: number; y?: number };
        resize?: boolean;
        useWorker?: boolean;
    }

    interface ConfettiInstance {
        (options?: ConfettiOptions): void;
    }

    interface ConfettiModule {
        create(canvas: HTMLCanvasElement, options?: ConfettiOptions): ConfettiInstance;
    }

    const confetti: ConfettiModule;
    export default confetti;
}
