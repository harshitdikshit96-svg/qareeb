// Anonymous visitor-id cookie shared between middleware (which sets it)
// and the public pages (which read it to attribute a pageview). No
// personal data — just a random id used to dedupe same-day repeat visits
// for the unique-visitor count.
export const VISITOR_COOKIE_NAME = "qareeb_vid";
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
