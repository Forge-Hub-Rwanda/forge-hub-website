import { createServerClient } from "@supabase/ssr";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Gate for `/admin/*`, and the ONLY place the admin session is renewed.
 *
 * ## Why renewal has to happen here
 *
 * Supabase sessions are an access token (about an hour) plus a refresh token
 * that can be spent exactly once. Spending it returns a new pair, and the new
 * refresh token must reach the browser as a cookie — if it does not, the
 * browser's next request presents the spent one, Supabase answers "Invalid
 * Refresh Token: Already Used", and the session is revoked.
 *
 * Server Components cannot set cookies. So if a page or layout is the first
 * code to notice the access token is about to expire, it renews the session
 * and the new refresh token is thrown away. Supabase renews once a token is
 * within 90 seconds of expiry, and in `next dev` a first compile can take far
 * longer than that between this proxy running and the page rendering — which
 * is exactly how admins were being signed out when they came back to a tab.
 *
 * So this proxy renews EARLY: any session with less than `RENEW_WITHIN`
 * left is renewed here, where the new cookies can be written. Pages then never
 * see a token close enough to expiry to renew it themselves.
 *
 * ## Signing out
 *
 * A session only ends when it is genuinely over (signed out, revoked, or a
 * spent refresh token). Its dead cookies are cleared and the admin is sent to
 * `/login?next=<page>`, so signing back in returns them to where they were.
 * A network blip is NOT treated as signed out.
 */

/** Renew when less than this is left on the access token. */
const RENEW_WITHIN_SECONDS = 10 * 60;

type PendingCookie = { name: string; value: string; options: object };

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  const path = request.nextUrl.pathname + request.nextUrl.search;
  // A Server Action (a form submit) is answered by the action itself, which
  // reports "Not authorized." to the form instead of being redirected — a
  // redirect there would swap the page out from under the form.
  const isAction = request.headers.has("next-action");

  // No Supabase auth cookie means there is definitely no session.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!hasAuthCookie) {
    return isAction
      ? NextResponse.next({ request })
      : toLogin(request, path, []);
  }

  // Everything Supabase wants to write (renewed tokens, or the removal of a
  // dead session) is collected here and applied to whichever response we send.
  const pending: PendingCookie[] = [];
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

  // Validates the session with Supabase, renewing it if it is within 90s.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user) {
    // A network failure is not a sign-out: keep the cookies and let the admin
    // layout decide on the next request.
    if (error && isAuthRetryableFetchError(error)) {
      return NextResponse.next({ request });
    }
    // Genuinely over. `pending` holds the removal of the dead cookies, so the
    // browser stops presenting a spent token on every request.
    return isAction
      ? withCookies(NextResponse.next({ request }), pending)
      : toLogin(request, path, pending);
  }

  // Healthy session: renew it early if it is getting close to expiry.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const secondsLeft = (session?.expires_at ?? 0) - Date.now() / 1000;
  if (session && secondsLeft < RENEW_WITHIN_SECONDS) {
    // On failure the current access token is still valid for `secondsLeft`,
    // so carry on with it; the next request tries again.
    await supabase.auth.refreshSession();
  }

  // Hand the (possibly renewed) cookies to the page being rendered, and tell
  // the admin layout which page this is, for its `?next=` link if it needs one.
  for (const { name, value } of pending) {
    request.cookies.set(name, value);
  }
  const headers = new Headers(request.headers);
  headers.set("x-admin-path", path);

  return withCookies(NextResponse.next({ request: { headers } }), pending);
}

function withCookies(response: NextResponse, cookies: PendingCookie[]) {
  for (const { name, value, options } of cookies) {
    response.cookies.set(name, value, options);
  }
  return response;
}

function toLogin(request: NextRequest, path: string, cookies: PendingCookie[]) {
  const login = new URL("/login", request.url);
  login.searchParams.set("next", path);
  return withCookies(NextResponse.redirect(login), cookies);
}

export const config = {
  matcher: ["/admin/:path*"],
};
