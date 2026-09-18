"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Registered after load so it never competes with the page's own
    // network requests for bandwidth on first paint.
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
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
