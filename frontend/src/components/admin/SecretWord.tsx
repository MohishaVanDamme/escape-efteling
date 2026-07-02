import { useEffect, useState } from "react";
import { fetchSecretWord, updateSecretWord } from "../../services/wordService";
import { Button, Input, TextField } from "@heroui/react";

export function SecretWord() {
    const [secretWord, setSecretWord] = useState("");

    useEffect(() => {
        const loadSecretWord = async () => {
            const word = await fetchSecretWord();
            if (word) {
                setSecretWord(word);
            }
        };

        loadSecretWord();
    }, []);

    return (
        <div className="px-5">
            <p className="text-2xl font-bold py-5 text-center text-[#F8F1E7]">
                Geheim woord
            </p>

            <p className="text-[#F8F1E7] pb-5">Het geheime woord is: {secretWord}</p>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <TextField className="w-full md:w-xl">
                    <Input placeholder="Verander het geheim woord" onChange={(e) => setSecretWord(e.target.value)} />
                </TextField>

                <Button
                    onPress={() => updateSecretWord(secretWord)}>
                    Opslaan
                </Button>
            </div>
        </div>
    )
}