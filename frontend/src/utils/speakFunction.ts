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
            voices.find(v => v.name.toLowerCase().includes("female")) ||
            voices.find(v => v.name.toLowerCase().includes("vrouw")) ||
            voices.find(v => v.name.toLowerCase().includes("google nederlands")) ||
            voices.find(v => v.lang === "nl-NL");

        if (preferred) utterance.voice = preferred;


        synth.cancel();
        synth.speak(utterance);
    }

    if (synth.getVoices().length === 0) {
        synth.onvoiceschanged = setVoiceAndSpeak;
    } else {
        setVoiceAndSpeak();
    }
}