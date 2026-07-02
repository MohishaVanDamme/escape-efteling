import { toast } from "@heroui/react";
import { supabase } from "../lib/supabase";

export const fetchSecretWord = async (): Promise<string> => {
    const { data, error } = await supabase
        .from("setting")
        .select("secret_word")
        .single();


    if (error) {
        console.error("Fout bij ophalen geheim woord:", error);
        toast.danger?.("Kon geheim woord niet ophalen.");
        return "";
    }

    return data.secret_word;
};

export const updateSecretWord = async (
  secretWord: string
): Promise<boolean> => {
  const { data: row, error: selectError } = await supabase
    .from("setting")
    .select("id")
    .single();

  if (selectError || !row) {
    console.error(selectError);
    toast("Kon instellingen niet ophalen.");
    return false;
  }

  const { error: updateError } = await supabase
    .from("setting")
    .update({ secret_word: secretWord })
    .eq("id", row.id);

  if (updateError) {
    console.error(updateError);
    toast("Opslaan mislukt.");
    return false;
  }

  toast("Geheim woord opgeslagen!");
  return true;
};