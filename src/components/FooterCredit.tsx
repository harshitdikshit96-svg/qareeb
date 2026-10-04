"use client";

import { useDictionary } from "@/lib/i18n/LocaleContext";

// Pulled out of layout.tsx so this one translated string doesn't require
// the root layout itself to know the locale server-side (which would
// force cookies()/dynamic rendering on every page — see layout.tsx).
export default function FooterCredit() {
  const dict = useDictionary();
  return (
    <>
      {dict.footer.credit}{" "}
      <a
        href="https://www.harshitcreates.in"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        harshitcreates.in
      </a>
    </>
  );
}
