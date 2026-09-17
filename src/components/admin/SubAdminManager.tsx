import {
  getMasjidAdminsForMasjid,
  getRecentTimingChanges,
} from "@/lib/masjidAdminsDb";
import {
  createSubAdminAction,
  deleteSubAdminAction,
  resetSubAdminPasswordAction,
} from "@/lib/subAdminActions";

export default async function SubAdminManager({
  masjidId,
  errorMessage,
}: {
  masjidId: string;
  errorMessage?: string;
}) {
  const [admins, changes] = await Promise.all([
    getMasjidAdminsForMasjid(masjidId),
    getRecentTimingChanges(masjidId, 8),
  ]);

  const boundCreate = createSubAdminAction.bind(null, masjidId);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Sub-admins</p>
        <p className="text-xs text-neutral-500 mt-0.5">
          Can only update this masjid&apos;s prayer timings — nothing else.
        </p>
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      {admins.length > 0 && (
        <div className="rounded-xl border border-black/10 divide-y divide-black/5">
          {admins.map((admin) => (
            <div key={admin.id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="flex-1 min-w-[8rem]">
                <p className="text-sm font-medium truncate">{admin.username}</p>
                <p className="text-xs text-neutral-500">
                  Added {new Date(admin.createdAt).toLocaleDateString()}
                </p>
              </div>

              <details className="text-xs">
                <summary className="cursor-pointer text-emerald-700 select-none">
                  Reset password
                </summary>
                <form
                  action={resetSubAdminPasswordAction.bind(null, masjidId, admin.id)}
                  className="flex items-center gap-2 mt-2"
                >
                  <input
                    name="password"
                    type="password"
                    minLength={6}
                    required
                    placeholder="New password"
                    className="input py-1"
                  />
                  <button type="submit" className="text-emerald-700 font-medium shrink-0">
                    Save
                  </button>
                </form>
              </details>

              <form action={deleteSubAdminAction.bind(null, masjidId, admin.id)}>
                <button type="submit" className="text-sm text-red-600 font-medium shrink-0">
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {admins.length === 0 && (
        <p className="text-xs text-neutral-500">No sub-admin yet for this masjid.</p>
      )}

      <form action={boundCreate} className="rounded-xl border border-black/10 p-3 space-y-2">
        <p className="text-xs font-medium">Add a sub-admin</p>
        <div className="flex flex-wrap gap-2">
          <input name="username" placeholder="username" required className="input flex-1 min-w-[7rem]" />
          <input
            name="password"
            type="password"
            placeholder="password"
            minLength={6}
            required
            className="input flex-1 min-w-[7rem]"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-emerald-700 text-white text-sm font-medium px-4"
          >
            Add
          </button>
        </div>
      </form>

      {changes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-2">Recent timing changes</p>
          <div className="space-y-1.5">
            {changes.map((c) => (
              <p key={c.id} className="text-xs text-neutral-500">
                <span className="font-medium text-neutral-700">{c.changedBy}</span> updated
                timings · {new Date(c.changedAt).toLocaleString()}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
