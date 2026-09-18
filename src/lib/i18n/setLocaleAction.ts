"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale } from "./dictionaries";
import { LOCALE_COOKIE_MAX_AGE, LOCALE_COOKIE_NAME } from "./locale";

export async function setLocaleAction(formData: FormData) {
  const locale = formData.get("locale");
  const path = formData.get("path");

  if (typeof locale === "string" && isLocale(locale)) {
    const cookieStore = await cookies();
    cookieStore.set(LOCALE_COOKIE_NAME, locale, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }

  const destination = typeof path === "string" && path.startsWith("/") ? path : "/";
  redirect(destination);
}
