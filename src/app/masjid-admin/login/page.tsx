import { masjidAdminLoginAction } from "@/lib/masjidAdminActions";

export default async function MasjidAdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <form
        action={masjidAdminLoginAction}
        className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 w-full max-w-sm space-y-4"
      >
        <div>
          <h1 className="text-xl font-semibold">Masjid Admin</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to update your masjid&apos;s prayer timings.
          </p>
        </div>

        <input type="hidden" name="next" value={next ?? "/masjid-admin"} />

        <div className="space-y-1">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            className="input"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input id="password" name="password" type="password" required className="input" />
        </div>

        {error && <p className="text-sm text-red-600">Incorrect username or password.</p>}

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
