import { notFound } from "next/navigation";
import TimingsForm from "@/components/admin/TimingsForm";
import { getMasjidByIdFromDb } from "@/lib/masjidsDb";
import { getRecentTimingChanges } from "@/lib/masjidAdminsDb";
import { masjidAdminLogoutAction, updateOwnMasjidTimingsAction } from "@/lib/masjidAdminActions";
import { requireMasjidAdminSession } from "@/lib/requireMasjidAdmin";

export const dynamic = "force-dynamic";

export default async function MasjidAdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await requireMasjidAdminSession();
  const { saved } = await searchParams;

  const masjid = await getMasjidByIdFromDb(session.masjidId);
  if (!masjid) notFound();

  const changes = await getRecentTimingChanges(session.masjidId, 8);

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">{masjid.name}</h1>
            <p className="text-xs text-neutral-500">Signed in as {session.username}</p>
          </div>
          <form action={masjidAdminLogoutAction}>
            <button
              type="submit"
              className="shrink-0 rounded-lg border border-black/10 text-sm px-3 py-2"
            >
              Log out
            </button>
          </form>
        </div>

        {saved && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            Timings updated.
          </p>
        )}

        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <TimingsForm timings={masjid.timings} action={updateOwnMasjidTimingsAction} />
        </div>

        {changes.length > 0 && (
          <div className="bg-white rounded-2xl border border-black/5 p-4">
            <p className="text-xs font-medium text-neutral-500 mb-2">Recent changes</p>
            <div className="space-y-1.5">
              {changes.map((c) => (
                <p key={c.id} className="text-xs text-neutral-500">
                  <span className="font-medium text-neutral-700">{c.changedBy}</span> ·{" "}
                  {new Date(c.changedAt).toLocaleString()}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
