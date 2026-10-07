import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Uploads a file to a public Supabase Storage bucket and returns both its
 * public URL (for rendering) and its storage path (for deleting it later).
 * The caller must already have confirmed the current session is an admin —
 * this helper enforces nothing.
 */
export async function uploadImage(
  supabase: SupabaseClient,
  bucket: string,
  file: File,
): Promise<{ url: string; path: string }> {
  const path = `${crypto.randomUUID()}-${file.name}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { url: publicUrl, path };
}

/**
 * Deletes a previously uploaded image. A null/undefined path (no photo was
 * ever set) is a safe no-op, so call sites can always call through without
 * checking first.
 */
export async function deleteImage(
  supabase: SupabaseClient,
  bucket: string,
  path: string | null | undefined,
): Promise<void> {
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}
