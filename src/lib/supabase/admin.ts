import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses Row Level Security entirely. Used
 * only for managing the `admins` allowlist itself, since a policy on that
 * table that queries `admins` to check admin-ness would be circular.
 *
 * This client enforces nothing on its own: every call site must call
 * `requireAdmin()` first and check `isAdmin` before using it.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase service role is not configured.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
