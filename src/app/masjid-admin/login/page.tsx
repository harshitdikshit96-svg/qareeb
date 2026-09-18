import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { masjidAdminLoginAction } from "@/lib/masjidAdminActions";

export default async function MasjidAdminLoginPage({
  searchParams,
}: PageProps<"/masjid-admin/login">) {
  const { error, next: rawNext } = await searchParams;
  const next = Array.isArray(rawNext) ? rawNext[0] : rawNext;
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <form
        action={masjidAdminLoginAction}
        className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 w-full max-w-sm space-y-4"
      >
        <div>
          <h1 className="text-xl font-semibold">{dict.masjidAdmin.loginTitle}</h1>
          <p className="text-sm text-neutral-500 mt-1">{dict.masjidAdmin.loginSubtitle}</p>
        </div>

        <input type="hidden" name="next" value={next ?? "/masjid-admin"} />

        <div className="space-y-1">
          <label htmlFor="username" className="text-sm font-medium">
            {dict.masjidAdmin.username}
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
            {dict.masjidAdmin.password}
          </label>
          <input id="password" name="password" type="password" required className="input" />
        </div>

        {error && <p className="text-sm text-red-600">{dict.masjidAdmin.incorrectCredentials}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-700 text-white py-2 text-sm font-medium"
        >
          {dict.masjidAdmin.signIn}
        </button>
      </form>
    </div>
  );
}
