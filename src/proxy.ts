import { NextRequest, NextResponse } from "next/server";
import type { NextFetchEvent } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionCookieValue } from "./lib/adminAuth";
import { MASJID_ADMIN_COOKIE_NAME, getMasjidAdminSession } from "./lib/masjidAdminAuth";
import { VISITOR_COOKIE_MAX_AGE, VISITOR_COOKIE_NAME } from "./lib/visitorCookie";
import { recordVisit } from "./lib/analytics";

// Matches "/masjids/<id>" exactly (not "/masjids" itself, and not any
// deeper sub-path) so a masjid detail visit can be attributed to its id.
const MASJID_DETAIL_PATTERN = /^\/masjids\/([^/]+)$/;

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const isLoginApi = pathname === "/api/admin/login";
    if (isLoginPage || isLoginApi) {
      return NextResponse.next();
    }

    const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await isValidSessionCookieValue(cookie))) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/masjid-admin")) {
    const isLoginPage = pathname === "/masjid-admin/login";
    if (isLoginPage) {
      return NextResponse.next();
    }

    const cookie = request.cookies.get(MASJID_ADMIN_COOKIE_NAME)?.value;
    const session = await getMasjidAdminSession(cookie);
    if (!session) {
      const loginUrl = new URL("/masjid-admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Every other page: make sure an anonymous visitor id is set, so repeat
  // same-day visits can be told apart from new ones.
  //
  // The actual DB write (recordVisit) also happens HERE now, not in the
  // page component. It used to run via next/server's after() inside
  // page.tsx / masjids/page.tsx / masjids/[id]/page.tsx, which required
  // those pages to call cookies()/headers() during render — and calling
  // either of those Dynamic APIs in a page (or layout) opts the WHOLE
  // route into per-request dynamic rendering (see Next's cookies() docs:
  // "Using it in a layout or page will opt a route into dynamic
  // rendering"). That was forcing marketing pages whose actual data
  // fetch is already cached (unstable_cache in masjidsRepo.ts) to be
  // rebuilt from scratch on every single request — the #1 LCP cost on
  // this site. Middleware has request-level access to cookies/headers
  // without that penalty, so the write moves here. @neondatabase/serverless
  // uses fetch() under the hood, which works fine in the Edge runtime
  // middleware runs in.
  //
  // event.waitUntil keeps this fire-and-forget: the response is returned
  // immediately and this promise finishes in the background, exactly like
  // after() did for the page before.
  let response: NextResponse;
  let visitorId: string;
  const hadVisitorCookie = !!request.cookies.get(VISITOR_COOKIE_NAME);

  if (!hadVisitorCookie) {
    visitorId = crypto.randomUUID();
    request.cookies.set(VISITOR_COOKIE_NAME, visitorId);
    response = NextResponse.next({ request });
    response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: "/",
    });
  } else {
    visitorId = request.cookies.get(VISITOR_COOKIE_NAME)!.value;
    response = NextResponse.next();
  }

  // Only count real page navigations (GET) — not Server Action POSTs
  // (bookmark toggles, the language switcher form, admin mutations) that
  // happen to share the same URL.
  if (request.method === "GET") {
    const masjidMatch = pathname.match(MASJID_DETAIL_PATTERN);
    event.waitUntil(
      recordVisit({
        visitorId,
        masjidId: masjidMatch ? masjidMatch[1] : null,
        referrer: request.headers.get("referer"),
        userAgent: request.headers.get("user-agent"),
        host: request.headers.get("host"),
      })
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/masjid-admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
