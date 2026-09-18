import Link from "next/link";
import { notFound } from "next/navigation";
import MasjidForm from "@/components/admin/MasjidForm";
import PhotoManager from "@/components/admin/PhotoManager";
import SubAdminManager from "@/components/admin/SubAdminManager";
import { getMasjidForAdmin, updateMasjidAction } from "@/lib/adminActions";

export const dynamic = "force-dynamic";

export default async function EditMasjidPage({
  params,
  searchParams,
}: PageProps<"/admin/[id]/edit">) {
  const { id } = await params;
  const { subadmin_error } = await searchParams;
  const subadminError = Array.isArray(subadmin_error) ? subadmin_error[0] : subadmin_error;
  const masjid = await getMasjidForAdmin(id);
  if (!masjid) notFound();

  const boundAction = updateMasjidAction.bind(null, id);

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <Link href="/admin" className="text-sm text-neutral-500">
          ← Back to listings
        </Link>
        <h1 className="text-xl font-semibold">Edit masjid</h1>

        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <PhotoManager masjidId={masjid.id} images={masjid.images} />
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <SubAdminManager masjidId={masjid.id} errorMessage={subadminError} />
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <MasjidForm masjid={masjid} action={boundAction} />
        </div>
      </div>
    </div>
  );
}
