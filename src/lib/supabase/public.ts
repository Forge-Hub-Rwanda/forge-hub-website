import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous Supabase client for server code that acts as "a visitor" (the
 * contact form). It carries no session; Row Level Security decides what it may
 * do, so it can only insert messages.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not set.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
