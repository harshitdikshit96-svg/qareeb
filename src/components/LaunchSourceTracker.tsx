"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analyticsClient";

// Chrome sets document.referrer to "android-app://<package>" when a page
// is opened from an installed Trusted Web Activity (the Play Store app),
// as opposed to a normal browser tab/bookmark. Without this, GA4 can't
// tell an installed-app session apart from ordinary mobile Chrome
// traffic — see docs/analytics-setup.md for how to build the "installed
// users" segment from this event in GA4.
//
// Fires once per browser session (sessionStorage-guarded) since this
// component mounts on every client-side navigation within the app.
export default function LaunchSourceTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("qareeb_launch_source_sent")) return;
      const ref = document.referrer || "";
      const launchSource = ref.startsWith("android-app://com.qareeb.twa")
        ? "twa"
        : ref.startsWith("android-app://")
          ? "other_android_app"
          : null;
      if (!launchSource) return;
      sessionStorage.setItem("qareeb_launch_source_sent", "1");
      trackEvent("launch_source_detected", { launch_source: launchSource });
    } catch {
      // sessionStorage can throw in some privacy modes — never let this
      // break the page.
    }
  }, []);

  return null;
}
