"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import {
  addMasjidImageInDb,
  createMasjidInDb,
  deleteMasjidFromDb,
  getAllMasjidsFromDb,
  getMasjidByIdFromDb,
  removeMasjidImageInDb,
  updateMasjidInDb,
} from "./masjidsDb";
import { logTimingChange } from "./masjidAdminsDb";
import { deleteMasjidPhotoByUrl, uploadMasjidPhoto } from "./cloudinary";
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  checkPassword,
  createSessionCookieValue,
} from "./adminAuth";
import { requireSuperAdminSession } from "./requireAdmin";
import { resolveAndExtractLatLng } from "./googleMapsLink";
import type { MasjidInput, PrayerTimes } from "./types";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!checkPassword(password)) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, await createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: "/",
  });

  redirect(next || "/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

export async function extractLatLngAction(
  mapsUrl: string
): Promise<{ lat: number; lng: number } | null> {
  if (!mapsUrl.trim()) return null;
  return resolveAndExtractLatLng(mapsUrl);
}

function readMasjidInput(formData: FormData): MasjidInput {
  const timings: PrayerTimes = {
    fajr: String(formData.get("fajr") ?? ""),
    zohar: String(formData.get("zohar") ?? ""),
    asr: String(formData.get("asr") ?? ""),
    maghrib: String(formData.get("maghrib") ?? ""),
    isha: String(formData.get("isha") ?? ""),
    jummah: String(formData.get("jummah") ?? ""),
  };

  const latRaw = String(formData.get("lat") ?? "").trim();
  const lngRaw = String(formData.get("lng") ?? "").trim();

  return {
    id: String(formData.get("id") ?? "").trim() || undefined,
    name: String(formData.get("name") ?? "").trim(),
    area: String(formData.get("area") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "Lucknow").trim() || "Lucknow",
    lat: latRaw ? parseFloat(latRaw) : null,
    lng: lngRaw ? parseFloat(lngRaw) : null,
    geoPrecision: latRaw && lngRaw ? "exact" : null,
    verified: formData.get("verified") === "on",
    timings,
  };
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

export async function createMasjidAction(formData: FormData) {
  await requireSuperAdminSession();
  const input = readMasjidInput(formData);
  const masjid = await createMasjidInDb(input);
  updateTag("masjids");
  redirect(`/admin/${masjid.id}/edit`);
}

export async function updateMasjidAction(id: string, formData: FormData) {
  await requireSuperAdminSession();
  const input = readMasjidInput(formData);
  const before = await getMasjidByIdFromDb(id);
  await updateMasjidInDb(id, input);
  if (before && !timingsEqual(before.timings, input.timings)) {
    await logTimingChange(id, "super:admin", before.timings, input.timings);
  }
  updateTag("masjids");
  redirect("/admin");
}

export async function deleteMasjidAction(id: string) {
  await requireSuperAdminSession();
  await deleteMasjidFromDb(id);
  updateTag("masjids");
  redirect("/admin");
}

export async function listMasjidsForAdmin() {
  return getAllMasjidsFromDb();
}

export async function getMasjidForAdmin(id: string) {
  return getMasjidByIdFromDb(id);
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB per photo

export async function uploadMasjidPhotosAction(id: string, formData: FormData) {
  await requireSuperAdminSession();

  const masjid = await getMasjidByIdFromDb(id);
  if (!masjid) {
    throw new Error(`Masjid with id "${id}" not found`);
  }

  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    redirect(`/admin/${id}/edit`);
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) continue; // skip disallowed types
    if (file.size > MAX_IMAGE_BYTES) continue; // skip oversized files

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadMasjidPhoto(id, buffer, file.type);
    await addMasjidImageInDb(id, url);
  }

  updateTag("masjids");
  redirect(`/admin/${id}/edit`);
}

export async function deleteMasjidPhotoAction(id: string, imageUrl: string) {
  await requireSuperAdminSession();
  await deleteMasjidPhotoByUrl(imageUrl);
  await removeMasjidImageInDb(id, imageUrl);
  updateTag("masjids");
  redirect(`/admin/${id}/edit`);
}
