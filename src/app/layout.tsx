import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qareeb — Find Nearby Masjids",
  description:
    "Qareeb is a central directory of masjids in your area with prayer (jamaat) timings, so you can find one that fits your schedule.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="flex-1 max-w-md w-full mx-auto pb-24">
          {children}
          <p className="px-4 pt-8 pb-2 text-center text-[11px] text-muted">
            Designed &amp; Developed by{" "}
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
      </body>
    </html>
  );
}
