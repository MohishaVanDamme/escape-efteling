export function AudioPlayer({ audioUrl }: { audioUrl: string }) {
    return (
        <audio controls>
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support audio.
        </audio>
    )
}