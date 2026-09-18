"use client";

import { useDictionary } from "@/lib/i18n/LocaleContext";

export type SortMode = "distance" | "prayer";

export default function SortToggle({
  value,
  onChange,
  distanceDisabled,
}: {
  value: SortMode;
  onChange: (mode: SortMode) => void;
  distanceDisabled?: boolean;
}) {
  const dict = useDictionary();

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted">{dict.sortToggle.sortBy}</span>
      <div className="inline-flex rounded-full border border-black/10 bg-card p-0.5">
        <button
          type="button"
          onClick={() => onChange("distance")}
          disabled={distanceDisabled}
          className={`leading-none px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-40 ${
            value === "distance" ? "bg-brand text-white" : "text-foreground"
          }`}
        >
          {dict.sortToggle.distance}
        </button>
        <button
          type="button"
          onClick={() => onChange("prayer")}
          className={`leading-none px-3 py-1.5 rounded-full font-medium transition-colors ${
            value === "prayer" ? "bg-brand text-white" : "text-foreground"
          }`}
        >
          {dict.sortToggle.nextJamaat}
        </button>
      </div>
    </div>
  );
}
