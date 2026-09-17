import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionCookieValue } from "./lib/adminAuth";
import { MASJID_ADMIN_COOKIE_NAME, getMasjidAdminSession } from "./lib/masjidAdminAuth";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/masjid-admin/:path*"],
};
