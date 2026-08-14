"use client";

import { useState } from "react";

export default function SearchFilterBar({
  query,
  onQueryChange,
  areas,
  selectedArea,
  onAreaChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  areas: string[];
  selectedArea: string | null;
  onAreaChange: (area: string | null) => void;
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 bg-card rounded-2xl shadow-sm border border-black/5 px-4 py-3">
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search masjid near you..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
        />
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          aria-label="Toggle filters"
          className={`shrink-0 ${selectedArea ? "text-brand" : "text-muted"}`}
        >
          <FilterIcon />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={() => onAreaChange(null)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              selectedArea === null
                ? "bg-brand text-white border-brand"
                : "bg-card text-foreground border-black/10"
            }`}
          >
            All areas
          </button>
          {areas.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => onAreaChange(area)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                selectedArea === area
                  ? "bg-brand text-white border-brand"
                  : "bg-card text-foreground border-black/10"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}
