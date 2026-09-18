"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/lib/i18n/LocaleContext";
import { MosqueIcon } from "@/components/icons";

const DISMISSED_KEY = "qareeb_install_prompt_dismissed_at";
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const SHOW_DELAY_MS = 1500;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function recentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    // Best-effort only — worst case the prompt shows again next visit.
  }
}

function detectIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && !("MSStream" in window);
}

// Shown once per home-page load (subject to the dismissal cooldown) to
// nudge visitors toward installing the PWA. Chrome/Android gets the native
// install flow via `beforeinstallprompt`; iOS Safari has no such API, so
// it gets a short "Add to Home Screen" instruction sheet instead.
export default function InstallPrompt() {
  const dict = useDictionary();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos] = useState(detectIos);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIos) {
      timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    }

    const handleAppInstalled = () => {
      markDismissed();
      setVisible(false);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (timer) clearTimeout(timer);
    };
  }, [isIos]);

  if (!visible) return null;

  const dismiss = () => {
    markDismissed();
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    markDismissed();
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-24 sm:items-center sm:pb-4">
      <div className="w-full max-w-sm rounded-3xl bg-card border border-black/5 shadow-xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 h-11 w-11 rounded-2xl bg-brand flex items-center justify-center text-white">
            <MosqueIcon size={24} />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-sm">
              {isIos ? dict.pwaInstall.iosTitle : dict.pwaInstall.title}
            </h2>
            {!isIos && <p className="text-xs text-muted mt-1">{dict.pwaInstall.description}</p>}
          </div>
        </div>

        {isIos ? (
          <ol className="text-xs text-muted space-y-1.5 list-decimal list-inside">
            <li>{dict.pwaInstall.iosStep1}</li>
            <li>{dict.pwaInstall.iosStep2}</li>
          </ol>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-xl border border-black/10 text-sm font-medium px-4 py-2.5 text-foreground"
          >
            {dict.pwaInstall.notNowButton}
          </button>
          {!isIos && (
            <button
              type="button"
              onClick={install}
              className="flex-1 rounded-xl bg-brand text-white text-sm font-medium px-4 py-2.5"
            >
              {dict.pwaInstall.installButton}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
