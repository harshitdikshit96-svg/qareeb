// Locale cookie name/lifetime — intentionally NOT guarded by "server-only".
// setLocaleAction.ts (server) and locale.ts's getLocale() (server) use it,
// but so does LocaleContext.tsx's client-side correction (it reads this
// cookie directly via document.cookie — see the comment there for why).
export const LOCALE_COOKIE_NAME = "qareeb_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
