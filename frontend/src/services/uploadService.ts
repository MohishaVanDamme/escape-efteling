import { supabase } from "../lib/supabase";

export const uploadImage = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;

  const uploadRes = await supabase.storage.from("uploads").upload(fileName, file);
  if (uploadRes.error) throw uploadRes.error;

  const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);

  return data.publicUrl;
};

export const uploadImageForTeam = async (
  teamId: string,
  teamName: string,
  file: File,
  bucket = "uploads"
) => {
  const ext = file.name.split(".").pop() || "jpg";
  const safeName = teamName.replace(/[^a-z0-9-_.]/gi, "_").toLowerCase();
  const fileName = `${safeName}.${ext}`;
  const uploadRes = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
  if (uploadRes.error) throw uploadRes.error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  const publicUrl = data.publicUrl;

  const { error: teamErr } = await supabase
    .from("teams")
    .update({ escaped: true, escaped_image: publicUrl })
    .eq("id", teamId);

  if (teamErr) throw teamErr;

  return publicUrl;
};