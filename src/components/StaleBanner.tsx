"use client";

import { useDictionary } from "@/lib/i18n/LocaleContext";

export default function StaleBanner({ fetchedAt }: { fetchedAt: number | null }) {
  const dict = useDictionary();
  const label = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2">
      {dict.staleBanner.message(label)}
    </div>
  );
}
