import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Gate for `/admin/*`. Two jobs:
 *
 *  1. Fast-bounce a visitor with no session at all to `/login`.
 *  2. Keep the Supabase session fresh by letting `getUser()` rotate the
 *     access token, writing the new cookies onto the response.
 *
 * It deliberately does NOT treat a failed/transient `getUser()` as "logged
 * out". Next.js prefetches `<Link>` targets, so several requests can hit this
 * at once; if one of them rotates the refresh token, the others race and fail,
 * and `@supabase/ssr` would otherwise clear the auth cookies on the loser —
 * logging the user out mid-navigation. So refreshed cookies are applied only
 * when the session is healthy, and anything with a session cookie is passed
 * through to be judged authoritatively by `requireAdmin()` in the admin layout
 * (see `src/lib/supabase/server.ts`). That keeps the proxy from being a source
 * of spurious logouts while the layout stays the real authority.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  // No Supabase auth cookie means there is definitely no session to refresh.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!hasAuthCookie) {
    return redirectToLogin(request);
  }

  // Collect any cookies Supabase wants to write, but hold them: we only apply
  // them once we know the session is actually healthy (see below).
  const pending: { name: string; value: string; options: object }[] = [];
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        pending.push(...cookiesToSet);
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  let response = NextResponse.next({ request });

  if (user && pending.length > 0) {
    // Healthy session that rotated its token — persist the new cookies.
    for (const { name, value } of pending) {
      request.cookies.set(name, value);
    }
    response = NextResponse.next({ request });
    for (const { name, value, options } of pending) {
      response.cookies.set(name, value, options);
    }
  }

  // A clean "no session" (no user, no error) is a real sign-out → bounce.
  // A transient error still carrying a cookie is left for `requireAdmin()`.
  if (!user && !error) {
    return redirectToLogin(request);
  }

  return response;
}

function redirectToLogin(request: NextRequest) {
  const login = new URL("/login", request.url);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
