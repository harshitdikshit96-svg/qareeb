import type { PrayerTimes } from "@/lib/types";

// The 6 timing inputs, shared between the super-admin's full masjid form
// and the sub-admin's timings-only dashboard form. Plain markup, no
// client-side state — works fine inside either a client or server
// component parent.
export default function TimingFields({ timings }: { timings?: Partial<PrayerTimes> }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <TimingField name="fajr" label="Fajr" defaultValue={timings?.fajr} />
      <TimingField name="zohar" label="Zohar" defaultValue={timings?.zohar} />
      <TimingField name="asr" label="Asr" defaultValue={timings?.asr} />
      <TimingField name="maghrib" label="Maghrib" defaultValue={timings?.maghrib} />
      <TimingField name="isha" label="Isha" defaultValue={timings?.isha} />
      <TimingField name="jummah" label="Jumu'ah" defaultValue={timings?.jummah} />
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
