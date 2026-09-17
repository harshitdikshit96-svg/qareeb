import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  MASJID_ADMIN_COOKIE_NAME,
  getMasjidAdminSession,
  type MasjidAdminSession,
} from "./masjidAdminAuth";

/**
 * Reads and validates the current sub-admin session, redirecting to the
 * sub-admin login if missing/invalid/expired. Used both by the dashboard
 * page and by the timings-update action — the masjid a sub-admin can edit
 * always comes from this session, never from anything the client submits.
 */
export async function requireMasjidAdminSession(): Promise<MasjidAdminSession> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(MASJID_ADMIN_COOKIE_NAME)?.value;
  const session = await getMasjidAdminSession(cookie);
  if (!session) {
    redirect("/masjid-admin/login");
  }
  return session;
}
