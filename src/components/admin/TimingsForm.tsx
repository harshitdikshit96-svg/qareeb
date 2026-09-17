import TimingFields from "./TimingFields";
import type { PrayerTimes } from "@/lib/types";

// No "use state" needed — a plain <form action={serverAction}> works
// without any client JS, so this stays a server component.
export default function TimingsForm({
  timings,
  action,
}: {
  timings: PrayerTimes;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <TimingFields timings={timings} />
      <button
        type="submit"
        className="w-full rounded-lg bg-emerald-700 text-white text-sm font-medium px-5 py-2.5"
      >
        Save timings
      </button>
    </form>
  );
}
