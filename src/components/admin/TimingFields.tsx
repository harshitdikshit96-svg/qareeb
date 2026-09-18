import type { PrayerTimes } from "@/lib/types";

type TimingLabelKey = "fajr" | "zohar" | "asr" | "maghrib" | "isha" | "jummah";

const DEFAULT_LABELS: Record<TimingLabelKey, string> = {
  fajr: "Fajr",
  zohar: "Zohar",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  jummah: "Jumu'ah",
};

// The 6 timing inputs, shared between the super-admin's full masjid form
// and the sub-admin's timings-only dashboard form. Plain markup, no
// client-side state — works fine inside either a client or server
// component parent. `labels` lets a locale-aware caller (the sub-admin
// dashboard) supply translated labels; the super-admin form keeps the
// English defaults.
export default function TimingFields({
  timings,
  labels = DEFAULT_LABELS,
}: {
  timings?: Partial<PrayerTimes>;
  labels?: Record<TimingLabelKey, string>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <TimingField name="fajr" label={labels.fajr} defaultValue={timings?.fajr} />
      <TimingField name="zohar" label={labels.zohar} defaultValue={timings?.zohar} />
      <TimingField name="asr" label={labels.asr} defaultValue={timings?.asr} />
      <TimingField name="maghrib" label={labels.maghrib} defaultValue={timings?.maghrib} />
      <TimingField name="isha" label={labels.isha} defaultValue={timings?.isha} />
      <TimingField name="jummah" label={labels.jummah} defaultValue={timings?.jummah} />
    </div>
  );
}

function TimingField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-neutral-500">{label}</label>
      <input name={name} defaultValue={defaultValue} placeholder="e.g. 4:30 AM" className="input" />
    </div>
  );
}
