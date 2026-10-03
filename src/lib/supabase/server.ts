import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for server code that acts as "the signed-in admin" — server
 * actions, the admin pages, and `proxy.ts`. It reads and writes the session
 * cookie set by `@supabase/ssr`, so RLS policies that check `auth.uid()` or
 * `auth.jwt()` see the real signed-in user.
 */
export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not set.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Components can't set cookies; a Server Action or Route
        // Handler further up the stack already called this and will persist
        // them. This try/catch only swallows that read-only-context error.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — ignore.
        }
      },
    },
  });
}

/**
 * Is the current session an allowed admin? Checked by querying `admins`
 * (RLS lets a signed-in user see only their own row) rather than trusting
 * the session alone, so revoking a row in Supabase takes effect immediately.
 */
export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { supabase, user: null, isAdmin: false } as const;
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  return { supabase, user, isAdmin: Boolean(admin) } as const;
}
