import { loginAction } from "@/lib/adminActions";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { error, next: rawNext } = await searchParams;
  const next = Array.isArray(rawNext) ? rawNext[0] : rawNext;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <form
        action={loginAction}
        className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 w-full max-w-sm space-y-4"
      >
        <div>
          <h1 className="text-xl font-semibold">Qareeb Admin</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to manage masjid listings.
          </p>
        </div>

        <input type="hidden" name="next" value={next ?? "/admin"} />

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">Incorrect password. Try again.</p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-700 text-white py-2 text-sm font-medium"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
