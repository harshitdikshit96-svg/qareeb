import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function ProfilePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="px-4 pt-6 pb-4 space-y-3">
      <h1 className="text-2xl font-semibold">{dict.profile.title}</h1>
      <p className="text-sm text-muted">{dict.profile.placeholder}</p>
    </div>
  );
}
