"use client";

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
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted">Sort by</span>
      <div className="inline-flex rounded-full border border-black/10 bg-card p-0.5">
        <button
          type="button"
          onClick={() => onChange("distance")}
          disabled={distanceDisabled}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-40 ${
            value === "distance" ? "bg-brand text-white" : "text-foreground"
          }`}
        >
          Distance
        </button>
        <button
          type="button"
          onClick={() => onChange("prayer")}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
            value === "prayer" ? "bg-brand text-white" : "text-foreground"
          }`}
        >
          Next Jamaat
        </button>
      </div>
    </div>
  );
}
