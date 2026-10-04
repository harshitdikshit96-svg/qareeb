"use client";

// Thin client-side helper for pushing custom events to GTM's dataLayer.
// Safe to call before GTM has loaded (it queues in dataLayer and forces
// the lazy GTM load — see gtm.ts) and safe to call during SSR (no-ops).

declare global {
  interface Window {
    dataLayer?: unknown[];
    __loadGtm?: () => void;
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const push = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...params });
    // Any custom event is a signal the visitor is actually engaging, so
    // it's worth loading GTM immediately rather than waiting for the
    // scroll/timer fallback in gtm.ts.
    if (typeof window.__loadGtm === "function") window.__loadGtm();
  };
  // Defer by a frame so the browser paints the tap response first (keeps
  // GTM's listener work off the critical path for INP).
  requestAnimationFrame(() => setTimeout(push, 0));
}
