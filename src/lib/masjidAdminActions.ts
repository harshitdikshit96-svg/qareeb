"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { getMasjidAdminCredentialsByUsername, logTimingChange } from "./masjidAdminsDb";
import { getMasjidByIdFromDb, updateMasjidTimingsInDb } from "./masjidsDb";
import {
  MASJID_ADMIN_COOKIE_MAX_AGE,
  MASJID_ADMIN_COOKIE_NAME,
  createMasjidAdminSessionCookieValue,
  verifyPassword,
} from "./masjidAdminAuth";
import { requireMasjidAdminSession } from "./requireMasjidAdmin";
import type { PrayerTimes } from "./types";

export async function masjidAdminLoginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/masjid-admin");

  const credentials = username ? await getMasjidAdminCredentialsByUsername(username) : null;
  const ok = credentials
    ? await verifyPassword(password, credentials.passwordHash, credentials.passwordSalt)
    : false;

  if (!credentials || !ok) {
    redirect(`/masjid-admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(
    MASJID_ADMIN_COOKIE_NAME,
    await createMasjidAdminSessionCookieValue({
      masjidAdminId: credentials.id,
      masjidId: credentials.masjidId,
      username: credentials.username,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MASJID_ADMIN_COOKIE_MAX_AGE,
      path: "/",
    }
  );

  redirect(next || "/masjid-admin");
}

export async function masjidAdminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(MASJID_ADMIN_COOKIE_NAME);
  redirect("/masjid-admin/login");
}

function timingsEqual(a: PrayerTimes, b: PrayerTimes): boolean {
  return (
    a.fajr === b.fajr &&
    a.zohar === b.zohar &&
    a.asr === b.asr &&
    a.maghrib === b.maghrib &&
    a.isha === b.isha &&
    a.jummah === b.jummah
  );
}

export async function updateOwnMasjidTimingsAction(formData: FormData) {
  // The masjid being edited always comes from the sub-admin's own signed
  // session — never from a hidden form field — so one sub-admin can never
  // edit another masjid's timings by tampering with the request.
  const session = await requireMasjidAdminSession();

  const newTimings: PrayerTimes = {
    fajr: String(formData.get("fajr") ?? ""),
    zohar: String(formData.get("zohar") ?? ""),
    asr: String(formData.get("asr") ?? ""),
    maghrib: String(formData.get("maghrib") ?? ""),
    isha: String(formData.get("isha") ?? ""),
    jummah: String(formData.get("jummah") ?? ""),
  };

  const current = await getMasjidByIdFromDb(session.masjidId);
  if (!current) {
    throw new Error("Masjid not found");
  }

  await updateMasjidTimingsInDb(session.masjidId, newTimings);

  if (!timingsEqual(current.timings, newTimings)) {
    await logTimingChange(session.masjidId, session.username, current.timings, newTimings);
  }

  updateTag("masjids");
  redirect("/masjid-admin?saved=1");
}
