"use client";

import { usePathname } from "next/navigation";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { useDictionary, useLocale } from "@/lib/i18n/LocaleContext";
import { setLocaleAction } from "@/lib/i18n/setLocaleAction";
import type { Locale } from "@/lib/i18n/types";

const LOCALE_NAMES: Record<Locale, string> = {
  en: "EN",
  hi: "हिं",
  ur: "اردو",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const dict = useDictionary();
  const pathname = usePathname();

  return (
    <div
      className="flex items-center justify-center gap-1.5"
      role="group"
      aria-label={dict.languageSwitcher.label}
    >
      {LOCALES.map((l) => (
        <form key={l} action={setLocaleAction}>
          <input type="hidden" name="locale" value={l} />
          <input type="hidden" name="path" value={pathname} />
          <button
            type="submit"
            aria-pressed={locale === l}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              locale === l
                ? "bg-brand text-white border-brand"
                : "bg-card text-foreground border-black/10"
            }`}
          >
            {LOCALE_NAMES[l]}
          </button>
        </form>
      ))}
    </div>
  );
}
