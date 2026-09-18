import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionCookieValue } from "./lib/adminAuth";
import { MASJID_ADMIN_COOKIE_NAME, getMasjidAdminSession } from "./lib/masjidAdminAuth";
import { VISITOR_COOKIE_MAX_AGE, VISITOR_COOKIE_NAME } from "./lib/visitorCookie";

export async function middleware(request: NextRequest) {
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

  // Every other page: make sure an anonymous visitor id is set, so the
  // analytics recorded from the page itself can tell a same-day repeat
  // visit from a new one. Written onto the *request* too (not just the
  // response) so it's readable via cookies() in the same request's
  // Server Component render, not only on the visitor's next visit.
  if (!request.cookies.get(VISITOR_COOKIE_NAME)) {
    const visitorId = crypto.randomUUID();
    request.cookies.set(VISITOR_COOKIE_NAME, visitorId);
    const response = NextResponse.next({ request });
    response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/masjid-admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
