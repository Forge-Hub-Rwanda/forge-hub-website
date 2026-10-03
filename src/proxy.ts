import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Gate for `/admin/*`: redirects to `/login` when there is no signed-in
 * Supabase session. This only checks "is someone logged in" — whether they
 * are actually an allowed admin is re-checked against the `admins` table
 * inside every admin page and server action (see `requireAdmin` in
 * `src/lib/supabase/server.ts`), since Proxy coverage can silently drop if a
 * route moves and Server Functions aren't separate routes it can rely on.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const signIn = new URL("/login", request.url);
    return NextResponse.redirect(signIn);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
