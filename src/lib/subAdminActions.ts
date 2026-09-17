"use server";

import { redirect } from "next/navigation";
import {
  createMasjidAdmin,
  deleteMasjidAdmin,
  resetMasjidAdminPassword,
} from "./masjidAdminsDb";
import { requireSuperAdminSession } from "./requireAdmin";

// Super-admin-only CRUD over sub-admin accounts. Each one is called from
// a form on /admin/[id]/edit, bound to that masjid's id.

const USERNAME_PATTERN = /^[a-z0-9_-]{3,32}$/;
const MIN_PASSWORD_LENGTH = 6;

function fail(masjidId: string, message: string): never {
  redirect(`/admin/${masjidId}/edit?subadmin_error=${encodeURIComponent(message)}`);
}

export async function createSubAdminAction(masjidId: string, formData: FormData) {
  await requireSuperAdminSession();

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!USERNAME_PATTERN.test(username)) {
    fail(masjidId, "Username must be 3-32 characters: lowercase letters, numbers, - or _ only.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    fail(masjidId, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  try {
    await createMasjidAdmin(masjidId, username, password);
  } catch (err) {
    fail(masjidId, err instanceof Error ? err.message : "Could not create sub-admin.");
  }

  redirect(`/admin/${masjidId}/edit`);
}

export async function deleteSubAdminAction(masjidId: string, subAdminId: string) {
  await requireSuperAdminSession();
  await deleteMasjidAdmin(subAdminId);
  redirect(`/admin/${masjidId}/edit`);
}

export async function resetSubAdminPasswordAction(
  masjidId: string,
  subAdminId: string,
  formData: FormData
) {
  await requireSuperAdminSession();
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) {
    fail(masjidId, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  await resetMasjidAdminPassword(subAdminId, password);
  redirect(`/admin/${masjidId}/edit`);
}
