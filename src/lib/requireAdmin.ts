import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, isValidSessionCookieValue } from "./adminAuth";

/**
 * Defense-in-depth check for super-admin server actions. Middleware already
 * gates every /admin and /api/admin route, but a server action is itself a
 * directly-invocable endpoint, so mutating actions re-check the session
 * here rather than relying on route protection alone.
 */
export async function requireSuperAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!(await isValidSessionCookieValue(cookie))) {
    redirect("/admin/login");
  }
}
