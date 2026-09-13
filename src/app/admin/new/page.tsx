import Link from "next/link";
import MasjidForm from "@/components/admin/MasjidForm";
import { createMasjidAction } from "@/lib/adminActions";

export default function NewMasjidPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <Link href="/admin" className="text-sm text-neutral-500">
          ← Back to listings
        </Link>
        <h1 className="text-xl font-semibold">Add masjid</h1>
        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <MasjidForm action={createMasjidAction} />
        </div>
      </div>
    </div>
  );
}
