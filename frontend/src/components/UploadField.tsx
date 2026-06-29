import { useState } from "react";
import { Button } from "@heroui/react";
import { uploadImageForTeam } from "../services/uploadService";

export default function UploadField({
    teamId,
    teamName,
    onSuccess,
}: {
    teamId: string;
    teamName: string;
    onSuccess?: () => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;

        try {
            setLoading(true);
            setStatus("📡 Aan het uploaden...");

            await uploadImageForTeam(teamId, teamName, file);

            setFile(null);
            onSuccess?.();
        } catch (err) {
            console.error(err);
            setStatus("❌ Upload mislukt. Probeer opnieuw.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6">
            <label className="w-full max-w-sm cursor-pointer">
                <div className={`
                    border-2 border-dashed rounded-2xl p-8 text-center
                    transition-all duration-300
                    ${file ? "border-green-400 bg-[#F8F1E7]" : "border-gray-400 bg-[#F8F1E7]"}
                    hover:scale-105 hover:border-blue-400
                `}>
                    <div className="text-4xl mb-2">📸</div>

                    <p className="font-bold">
                        {file ? "Foto geselecteerd!" : "Tik om bewijs te uploaden"}
                    </p>

                    <p className="text-sm opacity-70 mt-1">
                        {file ? file.name : "Maak een foto of kies uit de galerij"}
                    </p>

                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                </div>
            </label>
            <Button
                onClick={handleUpload}
                isDisabled={!file || loading}
                className={`
                    px-6 py-3 rounded-xl font-bold transition
                    ${file && !loading
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-[#b71234] text-white border border-[#842229] cursor-not-allowed"}
                `}
            >
                {loading ? "Aan het uploaden..." : "Upload foto"}
            </Button>

            {status && (
                <div className="text-center font-mono text-sm mt-2">
                    {status}
                </div>
            )}
        </div>
    );
}