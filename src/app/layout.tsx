import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Nastaliq_Urdu, Noto_Sans_Devanagari } from "next/font/google";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import FooterCredit from "@/components/FooterCredit";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/localeCookie";
import { gtmBootstrap, GTM_ID } from "@/lib/gtm";
import LaunchSourceTracker from "@/components/LaunchSourceTracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// preload: false on both script fonts below — they're only applied under
// html[lang="hi"|"ur"] (globals.css), but next/font preloads every font at
// High priority by default. That was ~350 KiB of woff2 on every page load
// for English visitors, competing for bandwidth with the hero image (the
// LCP element). Without the preload, the browser only fetches them when
// localeAttrScript (below) actually switches <html lang>.
const notoUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
  preload: false,
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-hindi",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Qareeb — Find Nearby Masjids",
  description:
    "Qareeb is a central directory of masjids in your area with prayer (jamaat) timings, so you can find one that fits your schedule.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Qareeb",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#123832",
};

// lang/dir below are a static default (English, LTR) — NOT read from the
// locale cookie server-side. Reading it with cookies() here (the old
// getLocale() call) opted literally every page on the site into
// per-request dynamic rendering (Next's own docs: "Using it in a layout
// or page will opt a route into dynamic rendering"), which was the #1 LCP
// cost on this site — home, /masjids and every masjid detail page were
// being rebuilt from scratch on every single request even though their
// actual data fetch is cached.
//
// Instead, this inline script runs synchronously during HTML parsing
// (before first paint — see Next's "Preventing flash before hydration"
// guide) and corrects documentElement.lang/dir from the cookie directly in
// the browser. No flash for these two attributes specifically.
//
// The translated TEXT content elsewhere on the page is a separate,
// bigger problem an attribute-only script can't solve (swapping an entire
// page's language isn't a one-node DOM patch) — that's handled by
// LocaleProvider (see LocaleContext.tsx), which corrects itself
// client-side right after hydration. That one *does* cause a brief
// visible flash (English → the visitor's real locale) for returning
// hi/ur visitors — a deliberate, scoped trade-off for keeping the rest of
// the site statically rendered. suppressHydrationWarning on <html> is
// required because this script changes attributes React didn't set.
const localeAttrScript = `(function(){try{
var m=document.cookie.match(/(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)/);
var l=m?decodeURIComponent(m[1]):null;
if(l==="hi"){document.documentElement.lang="hi";}
else if(l==="ur"){document.documentElement.lang="ur";document.documentElement.dir="rtl";}
}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoUrdu.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <head>
        {/* Every masjid photo (including the first card's, which is
            typically the real LCP element once the hero image is fast —
            see HomeClient.tsx) is served from Cloudinary, a third-party
            origin. fetchpriority="high" on that <img> only affects how the
            browser SCHEDULES the request once a connection exists — it
            does nothing about the DNS lookup + TLS handshake that first
            has to happen to res.cloudinary.com, which is real round-trip
            time the browser would otherwise only start once it actually
            parses that <img> tag. preconnect tells the browser to do that
            handshake immediately, in parallel with everything else. */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script dangerouslySetInnerHTML={{ __html: localeAttrScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Google Tag Manager bootstrap — plain inline script (not next/script) so it
            runs during HTML parsing. Lazy-loads the real GTM container on first
            interaction / ad-click param / ~6s fallback — see src/lib/gtm.ts for why. */}
        <script
          id="gtm-bootstrap"
          dangerouslySetInnerHTML={{ __html: gtmBootstrap }}
        />
        {/* noscript fallback so GTM still fires (without the lazy-load behavior)
            for visitors with JavaScript disabled. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <LaunchSourceTracker />
        <ServiceWorkerRegister />
        <LocaleProvider>
          <div className="flex-1 max-w-md w-full mx-auto pb-24">
            {children}
            <div className="px-4 pt-6">
              <LanguageSwitcher />
            </div>
            <p className="px-4 pt-4 text-center text-[11px] text-muted">
              <FooterCredit />
            </p>
            <p className="px-4 pt-1 pb-2 text-center text-[11px] text-muted">
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
            </p>
          </div>
          <BottomNav />
        </LocaleProvider>
      </body>
    </html>
  );
}
