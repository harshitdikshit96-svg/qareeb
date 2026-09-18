import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale } from "./dictionaries";
import type { Locale } from "./types";

export const LOCALE_COOKIE_NAME = "qareeb_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ur" ? "rtl" : "ltr";
}
