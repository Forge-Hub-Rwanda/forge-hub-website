import { createClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY, SECRET. Supabase client that uses the service-role key, which
 * bypasses Row Level Security and can create auth users. Import it only from
 * server actions and server components, and only after `requireAdmin()` has
 * passed. Never import it from a client component, and never prefix the key
 * with NEXT_PUBLIC_.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (server only).",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
