import { useState } from "react";
import { uploadImageForTeam } from "../services/uploadService";

export default function UploadField({
    teamId,
    teamName,
}: {
    teamId: string;
    teamName: string;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    const handleUpload = async () => {
        if (!file) return;

        try {
            setStatus("Uploading...");
            const url = await uploadImageForTeam(teamId, teamName, file);
            console.log("Uploaded image:", url);
            setStatus("Uploaded and team marked as escaped.");
        } catch (err) {
            console.error(err);
            setStatus("Upload failed.");
        }
    };

    return (
        <div>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <button onClick={handleUpload} disabled={!file}>
                Upload foto
            </button>

            {status && <div className="mt-2">{status}</div>}
        </div>
    );
}