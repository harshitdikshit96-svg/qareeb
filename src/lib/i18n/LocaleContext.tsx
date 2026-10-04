"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { DEFAULT_LOCALE, getDictionary, isLocale } from "./dictionaries";
import { LOCALE_COOKIE_NAME } from "./localeCookie";
import type { Dictionary, Locale } from "./types";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readCookieLocale(): Locale {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`)
  );
  const value = match ? decodeURIComponent(match[1]) : null;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

// The locale cookie never changes without a full page navigation
// (setLocaleAction redirects after setting it), so there's nothing to
// subscribe to — but useSyncExternalStore is still the right tool, not a
// manual useEffect+setState: it's built specifically for "read a value
// that lives outside React, and give the server a different snapshot
// than the client" in one step, without an extra render pass.
function subscribe() {
  return () => {};
}

// getServerSnapshot (the 3rd arg below) is what the server — and the
// client's FIRST hydration pass — always uses: DEFAULT_LOCALE. See the
// comment on <html> in layout.tsx for why (reading the locale cookie
// server-side opts the whole site into per-request dynamic rendering,
// which was the #1 LCP cost on this site). Immediately after hydration,
// React re-renders using the real client snapshot (readCookieLocale()) —
// that one re-render is the deliberate, visible flash (English → the
// visitor's real locale) for returning hi/ur visitors, traded for keeping
// the rest of the site statically rendered.
export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readCookieLocale, () => DEFAULT_LOCALE);
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
