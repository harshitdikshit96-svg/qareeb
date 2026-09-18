"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Never register in dev: the SW's cache-first strategy for
    // /_next/static/* caches JS chunks that change on every save, so a
    // dev server restart or code edit can silently keep serving stale
    // bundles until the cache/SW is manually cleared. Only ever useful
    // (and only ever tested) against a production build.
    if (process.env.NODE_ENV !== "production") return;
    // Registered after load so it never competes with the page's own
    // network requests for bandwidth on first paint.
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
        // Installability is a progressive enhancement — a failed
        // registration (e.g. unsupported browser, blocked by an
        // extension) shouldn't affect the app itself.
      });
    };
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
