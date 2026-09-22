import Link from "next/link";
import AnalyticsTrendChart from "@/components/admin/AnalyticsTrendChart";
import {
  getAnalyticsTotals,
  getDailyTrend,
  getDeviceSplit,
  getTopMasjidsByViews,
  getTopReferrers,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

// Validated pair (dataviz skill, blue/orange slots) — kept distinct from the
// trend chart's aqua/yellow so the two charts don't imply a shared meaning.
const DEVICE_COLORS: Record<string, string> = {
  mobile: "#2a78d6",
  desktop: "#eb6834",
};

export default async function AdminAnalyticsPage() {
  const [totals, trend, topMasjids, referrers, devices] = await Promise.all([
    getAnalyticsTotals(30),
    getDailyTrend(30),
    getTopMasjidsByViews(15),
    getTopReferrers(30, 10),
    getDeviceSplit(30),
  ]);

  const totalDeviceVisits = devices.reduce((sum, d) => sum + d.visits, 0);

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Analytics</h1>
            <p className="text-sm text-neutral-500">Last 30 days, unless noted</p>
          </div>
          <Link href="/admin" className="text-sm text-neutral-500">
            ← Back to listings
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Pageviews (30d)" value={totals.pageviewsWindow.toLocaleString()} />
          <StatTile
            label="Visitor-days (30d)"
            value={totals.uniqueVisitorDaysWindow.toLocaleString()}
          />
          <StatTile
            label="Masjid views (all-time)"
            value={totals.totalMasjidViews.toLocaleString()}
          />
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5">
          <p className="text-sm font-medium mb-3">Daily pageviews</p>
          <AnalyticsTrendChart data={trend} />
        </div>

        <div className="bg-white rounded-2xl border border-black/5 divide-y divide-black/5">
          <p className="text-sm font-medium p-4 pb-2">Most-viewed masjids</p>
          {topMasjids.map((m, i) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-xs text-neutral-400 w-4 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.name}</p>
                <p className="text-xs text-neutral-500 truncate">{m.area}</p>
              </div>
              <span className="text-sm font-medium shrink-0">{m.viewCount.toLocaleString()}</span>
            </div>
          ))}
          {topMasjids.length === 0 && (
            <p className="text-sm text-neutral-500 p-4">No views recorded yet.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-black/5 p-4">
            <p className="text-sm font-medium mb-2">Top referrers (30d)</p>
            <div className="space-y-1.5">
              {referrers.map((r) => (
                <div key={r.referrerHost} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 truncate">{r.referrerHost}</span>
                  <span className="font-medium shrink-0">{r.visits.toLocaleString()}</span>
                </div>
              ))}
              {referrers.length === 0 && (
                <p className="text-xs text-neutral-500">No data yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-4">
            <p className="text-sm font-medium mb-2">Device split (30d)</p>
            {totalDeviceVisits > 0 ? (
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-neutral-100 flex gap-0.5 overflow-hidden">
                  {devices.map((d) => (
                    <div
                      key={d.deviceType}
                      className="rounded-full"
                      style={{
                        width: `${(d.visits / totalDeviceVisits) * 100}%`,
                        backgroundColor: DEVICE_COLORS[d.deviceType] ?? "#898781",
                      }}
                    />
                  ))}
                </div>
                {devices.map((d) => (
                  <div key={d.deviceType} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-neutral-600 capitalize">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: DEVICE_COLORS[d.deviceType] ?? "#898781" }}
                      />
                      {d.deviceType}
                    </span>
                    <span className="font-medium">
                      {((d.visits / totalDeviceVisits) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
    </div>
  );
}
