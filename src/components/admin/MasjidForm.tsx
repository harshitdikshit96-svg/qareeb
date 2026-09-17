"use client";

import { useState, useTransition } from "react";
import { extractLatLngAction } from "@/lib/adminActions";
import TimingFields from "./TimingFields";
import type { Masjid } from "@/lib/types";

type Props = {
  masjid?: Masjid;
  action: (formData: FormData) => void;
};

export default function MasjidForm({ masjid, action }: Props) {
  const [mapsUrl, setMapsUrl] = useState("");
  const [lat, setLat] = useState(masjid?.lat?.toString() ?? "");
  const [lng, setLng] = useState(masjid?.lng?.toString() ?? "");
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleExtract() {
    setExtractError(null);
    startTransition(async () => {
      const result = await extractLatLngAction(mapsUrl);
      if (!result) {
        setExtractError(
          "Couldn't find coordinates in that link. Paste the full Maps URL (not a shortened one if possible), or enter lat/lng manually below."
        );
        return;
      }
      setLat(result.lat.toString());
      setLng(result.lng.toString());
    });
  }

  return (
    <form action={action} className="space-y-5 max-w-xl">
      {masjid && <input type="hidden" name="id" value={masjid.id} />}

      <Field label="Name">
        <input
          name="name"
          defaultValue={masjid?.name}
          required
          className="input"
        />
      </Field>

      <Field label="Area / locality">
        <input
          name="area"
          defaultValue={masjid?.area}
          required
          className="input"
        />
      </Field>

      <Field label="Full address">
        <input
          name="address"
          defaultValue={masjid?.address}
          required
          className="input"
        />
      </Field>

      <Field label="City">
        <input
          name="city"
          defaultValue={masjid?.city ?? "Lucknow"}
          className="input"
        />
      </Field>

      <div className="rounded-xl border border-black/10 p-4 space-y-3 bg-neutral-50">
        <p className="text-sm font-medium">Location</p>
        <div className="flex gap-2">
          <input
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="Paste Google Maps link here"
            className="input flex-1"
          />
          <button
            type="button"
            onClick={handleExtract}
            disabled={isPending || !mapsUrl.trim()}
            className="shrink-0 rounded-lg bg-emerald-700 text-white text-sm font-medium px-4 disabled:opacity-50"
          >
            {isPending ? "Extracting…" : "Extract lat/lng"}
          </button>
        </div>
        {extractError && (
          <p className="text-xs text-red-600">{extractError}</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude">
            <input
              name="lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              inputMode="decimal"
              className="input"
            />
          </Field>
          <Field label="Longitude">
            <input
              name="lng"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              inputMode="decimal"
              className="input"
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="verified"
          name="verified"
          type="checkbox"
          defaultChecked={masjid?.verified ?? true}
          className="h-4 w-4"
        />
        <label htmlFor="verified" className="text-sm">
          Coordinates verified
        </label>
      </div>

      <div className="rounded-xl border border-black/10 p-4 space-y-3">
        <p className="text-sm font-medium">Jamaat timings</p>
        <TimingFields timings={masjid?.timings} />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-emerald-700 text-white text-sm font-medium px-5 py-2.5"
      >
        {masjid ? "Save changes" : "Add masjid"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
