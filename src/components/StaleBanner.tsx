export default function StaleBanner({ fetchedAt }: { fetchedAt: number | null }) {
  const label = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2">
      Couldn&apos;t reach the server just now — showing the last data we
      loaded{label ? ` (as of ${label})` : ""}. Pull to refresh in a bit.
    </div>
  );
}
