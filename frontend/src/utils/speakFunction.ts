export function speak(text: string) {
    if (typeof window === "undefined") return;

    const synth = window.speechSynthesis;
    if (!synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = 1.05;
    utterance.pitch = 1.15;
    utterance.volume = 0.95;

    function setVoiceAndSpeak() {
        const voices = synth.getVoices();

        const preferred =
            voices.find((v) => /female|vrouw|google nederlands/i.test(v.name)) ||
            voices.find((v) => /^nl(-|_)?/i.test(v.lang));

        if (preferred) {
            utterance.voice = preferred;
        }

        if (synth.speaking) {
            synth.cancel();
        }

        synth.speak(utterance);
    }

    if (synth.getVoices().length === 0) {
        const onVoicesChanged = () => {
            setVoiceAndSpeak();
            synth.removeEventListener("voiceschanged", onVoicesChanged);
        };

        synth.addEventListener("voiceschanged", onVoicesChanged);

        setTimeout(() => {
            if (synth.getVoices().length > 0) {
                setVoiceAndSpeak();
                synth.removeEventListener("voiceschanged", onVoicesChanged);
            }
        }, 500);
    } else {
        setVoiceAndSpeak();
    }
}
