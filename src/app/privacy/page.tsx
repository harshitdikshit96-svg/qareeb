export const metadata = {
  title: "Privacy Policy — Qareeb",
};

// Plain, untranslated legal page (Play Store and Apple both just need a
// stable URL to link to — the policy itself doesn't need to ship in
// Hindi/Urdu the way the rest of the product does).
export default function PrivacyPolicyPage() {
  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="text-muted text-sm mt-1">Last updated: September 2026</p>
      </header>

      <section className="bg-card rounded-2xl border border-black/5 p-5 space-y-4 text-sm leading-relaxed">
        <p>
          Qareeb is a directory of masjids with prayer (jamaat) timings. This
          page explains what data the app collects and how it&apos;s used.
          There&apos;s no account required to use Qareeb, no ads, and no data
          is sold or shared with advertisers.
        </p>

        <div>
          <h2 className="font-semibold mb-1">Location</h2>
          <p>
            If you allow location access, your device&apos;s coordinates are
            used only in your browser to sort masjids by distance and show
            the next prayer time for the nearest one. Your location is never
            sent to or stored on our servers.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-1">Bookmarks</h2>
          <p>
            Masjids you bookmark are saved only on your own device (browser
            local storage). We don&apos;t have access to your bookmark list.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-1">Anonymous analytics</h2>
          <p>
            We record basic, anonymous usage — page views, which masjid
            pages are viewed, device type (mobile/desktop), and which site
            referred you — to understand how the directory is used. This
            uses an anonymous, randomly generated id stored in a cookie for
            24 hours, only to avoid double-counting the same visitor on the
            same day. It isn&apos;t linked to your name, email, or any other
            personal identifier, and we don&apos;t use third-party analytics
            or advertising trackers.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-1">Cookies</h2>
          <p>
            Qareeb uses a small number of first-party cookies: an anonymous
            visitor id (24 hours, described above), your language preference,
            and — only for the small number of masjid caretakers and admins
            who manage listings — a login session cookie. None of these are
            used for advertising.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-1">Masjid admin accounts</h2>
          <p>
            Masjid caretakers with an admin login provide a username and
            password to update their masjid&apos;s prayer timings. Passwords
            are stored as salted cryptographic hashes, never in plain text.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-1">Contact</h2>
          <p>
            Questions about this policy or your data can be sent to{" "}
            <a href="mailto:faizkhan2293@outlook.com" className="underline">
              faizkhan2293@outlook.com
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
