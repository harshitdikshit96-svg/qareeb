import Link from "next/link";
import { deleteMasjidAction, listMasjidsForAdmin, logoutAction } from "@/lib/adminActions";

export const dynamic = "force-dynamic";

export default async function AdminListPage() {
  const masjids = await listMasjidsForAdmin();

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Masjid Listings</h1>
            <p className="text-sm text-neutral-500">{masjids.length} total</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/new"
              className="rounded-lg bg-emerald-700 text-white text-sm font-medium px-4 py-2"
            >
              + Add masjid
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-black/10 text-sm px-3 py-2"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 divide-y divide-black/5 overflow-hidden">
          {masjids.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-4">
              <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center overflow-hidden shrink-0">
                {m.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-emerald-700 text-xs">No pic</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{m.name}</p>
                <p className="text-xs text-neutral-500 truncate">
                  {m.area}, {m.city}
                  {m.lat !== null && m.lng !== null
                    ? ` · ${m.lat.toFixed(5)}, ${m.lng.toFixed(5)}`
                    : " · no coordinates"}
                </p>
              </div>
              <span
                className={`text-[11px] px-2 py-1 rounded-full shrink-0 ${
                  m.verified
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {m.verified ? "Verified" : "Unverified"}
              </span>
              <Link
                href={`/admin/${m.id}/edit`}
                className="text-sm text-emerald-700 font-medium shrink-0"
              >
                Edit
              </Link>
              <form
                action={async () => {
                  "use server";
                  await deleteMasjidAction(m.id);
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-red-600 font-medium shrink-0"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
          {masjids.length === 0 && (
            <p className="p-6 text-sm text-neutral-500 text-center">
              No masjids yet. Add the first one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
