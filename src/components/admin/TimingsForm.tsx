import TimingFields from "./TimingFields";
import type { PrayerTimes } from "@/lib/types";

type TimingLabelKey = "fajr" | "zohar" | "asr" | "maghrib" | "isha" | "jummah";

// No "use state" needed — a plain <form action={serverAction}> works
// without any client JS, so this stays a server component. `labels` and
// `saveLabel` let the sub-admin dashboard pass locale-aware strings; the
// super-admin form (which doesn't pass them) keeps the English defaults.
export default function TimingsForm({
  timings,
  action,
  labels,
  saveLabel = "Save timings",
}: {
  timings: PrayerTimes;
  action: (formData: FormData) => void;
  labels?: Record<TimingLabelKey, string>;
  saveLabel?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <TimingFields timings={timings} labels={labels} />
      <button
        type="submit"
        className="w-full rounded-lg bg-emerald-700 text-white text-sm font-medium px-5 py-2.5"
      >
        {saveLabel}
      </button>
    </form>
  );
}
