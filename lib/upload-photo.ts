import { createClient } from "./supabase-browser";

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Upload a person's profile photo to Supabase Storage.
 * Files are namespaced by family_id, then under a "people" subfolder.
 * Returns the public URL on success.
 */
export async function uploadPersonPhoto(
  file: File,
  familyId: string
): Promise<UploadResult> {
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "Photo must be under 8MB" };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "File must be an image" };
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${familyId}/people/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("family-photos")
    .upload(filename, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data } = supabase.storage.from("family-photos").getPublicUrl(filename);
  return { ok: true, url: data.publicUrl };
}
