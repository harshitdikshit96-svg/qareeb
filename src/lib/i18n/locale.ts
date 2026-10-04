import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale } from "./dictionaries";
import { LOCALE_COOKIE_MAX_AGE, LOCALE_COOKIE_NAME } from "./localeCookie";
import type { Locale } from "./types";

// Re-exported for existing importers (setLocaleAction.ts) — the values
// themselves now live in localeCookie.ts so a client component can read
// the cookie name too, without pulling in this "server-only" module.
export { LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE };

// Only used by pages that are already dynamic for other reasons (admin,
// profile) — the public marketing pages get their locale client-side now
// (see LocaleContext.tsx) specifically so they DON'T call this and opt
// into dynamic rendering.
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ur" ? "rtl" : "ltr";
}
