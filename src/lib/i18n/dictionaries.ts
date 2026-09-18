import type { Dictionary, Locale } from "./types";
import en from "./en";
import hi from "./hi";
import ur from "./ur";

export const LOCALES: Locale[] = ["en", "hi", "ur"];
export const DEFAULT_LOCALE: Locale = "en";

const dictionaries: Record<Locale, Dictionary> = { en, hi, ur };

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
