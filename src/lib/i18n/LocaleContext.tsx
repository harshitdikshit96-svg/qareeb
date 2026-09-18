"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getDictionary } from "./dictionaries";
import type { Dictionary, Locale } from "./types";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Only `locale` (a plain string) crosses the server/client boundary as a
// prop. The dictionary itself contains functions (parameterized strings)
// which React Server Components cannot serialize across that boundary, so
// it's built here, inside the client bundle, from the locale alone.
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const dict = useMemo(() => getDictionary(locale), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, dict }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx.locale;
}

export function useDictionary(): Dictionary {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useDictionary must be used within a LocaleProvider");
  return ctx.dict;
}
