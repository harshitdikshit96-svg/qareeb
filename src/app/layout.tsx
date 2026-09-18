import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Nastaliq_Urdu, Noto_Sans_Devanagari } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
import { getDirection, getLocale } from "@/lib/i18n/locale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-hindi",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const dir = getDirection(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${notoUrdu.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ServiceWorkerRegister />
        <LocaleProvider locale={locale}>
          <div className="flex-1 max-w-md w-full mx-auto pb-24">
            {children}
            <div className="px-4 pt-6">
              <LanguageSwitcher />
            </div>
            <p className="px-4 pt-4 pb-2 text-center text-[11px] text-muted">
              {dict.footer.credit}{" "}
              <a
                href="https://harshitcreates.in"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                harshitcreates.in
              </a>
            </p>
          </div>
          <BottomNav />
        </LocaleProvider>
      </body>
    </html>
  );
}
