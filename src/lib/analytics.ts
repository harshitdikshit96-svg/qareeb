import "server-only";
import { sql } from "./db";

// Lightweight, first-party, anonymous visit tracking. No third-party
// script, no personal data — just an anonymous id (set as a cookie by
// middleware) used only to tell a repeat same-day visit from a new one.
//
// Writes are called via next/server's after() from each public page, so
// they never add latency to the page response, and every write here is
// best-effort: a failure is swallowed rather than breaking the page.

const BOT_UA_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|preview|headless/i;
const MOBILE_UA_PATTERN = /Mobi|Android|iPhone|iPad|iPod/i;

function isLikelyBot(userAgent: string | null): boolean {
  return !!userAgent && BOT_UA_PATTERN.test(userAgent);
}

function isMobile(userAgent: string | null): boolean {
  return !!userAgent && MOBILE_UA_PATTERN.test(userAgent);
}

function referrerHost(referrer: string | null, ownHost: string | null): string {
  if (!referrer) return "direct";
  try {
    const url = new URL(referrer);
    if (ownHost && url.host === ownHost) return "internal";
    return url.host;
  } catch {
    return "direct";
  }
}

export type VisitInput = {
  visitorId: string | null;
  masjidId?: string | null;
  referrer: string | null;
  userAgent: string | null;
  host: string | null;
};

export async function recordVisit(input: VisitInput): Promise<void> {
  try {
    if (isLikelyBot(input.userAgent)) return;

    const client = sql();
    const today = new Date().toISOString().slice(0, 10);
    const visitorId = input.visitorId ?? crypto.randomUUID();
    const host = referrerHost(input.referrer, input.host);
    const deviceType = isMobile(input.userAgent) ? "mobile" : "desktop";

    // All the per-visit counters in one round trip via chained CTEs
    // (this is a single compound statement, not multiple statements —
    // the Neon HTTP driver is fine with that, just not with two
    // semicolon-separated statements in one call).
    if (input.masjidId) {
      await client`
        with visitor_insert as (
          insert into visitor_days (visitor_id, day)
          values (${visitorId}, ${today})
          on conflict do nothing
          returning 1
        ),
        daily_upsert as (
          insert into daily_stats (day, pageviews, unique_visitors)
          values (${today}, 1, (select count(*) from visitor_insert))
          on conflict (day) do update set
            pageviews = daily_stats.pageviews + 1,
            unique_visitors = daily_stats.unique_visitors + (select count(*) from visitor_insert)
          returning 1
        ),
        referrer_upsert as (
          insert into referrer_stats (day, referrer_host, visits)
          values (${today}, ${host}, 1)
          on conflict (day, referrer_host) do update set visits = referrer_stats.visits + 1
          returning 1
        ),
        device_upsert as (
          insert into device_stats (day, device_type, visits)
          values (${today}, ${deviceType}, 1)
          on conflict (day, device_type) do update set visits = device_stats.visits + 1
          returning 1
        ),
        masjid_update as (
          update masjids set view_count = view_count + 1 where id = ${input.masjidId}
          returning 1
        )
        select 1
      `;
    } else {
      await client`
        with visitor_insert as (
          insert into visitor_days (visitor_id, day)
          values (${visitorId}, ${today})
          on conflict do nothing
          returning 1
        ),
        daily_upsert as (
          insert into daily_stats (day, pageviews, unique_visitors)
          values (${today}, 1, (select count(*) from visitor_insert))
          on conflict (day) do update set
            pageviews = daily_stats.pageviews + 1,
            unique_visitors = daily_stats.unique_visitors + (select count(*) from visitor_insert)
          returning 1
        ),
        referrer_upsert as (
          insert into referrer_stats (day, referrer_host, visits)
          values (${today}, ${host}, 1)
          on conflict (day, referrer_host) do update set visits = referrer_stats.visits + 1
          returning 1
        ),
        device_upsert as (
          insert into device_stats (day, device_type, visits)
          values (${today}, ${deviceType}, 1)
          on conflict (day, device_type) do update set visits = device_stats.visits + 1
          returning 1
        )
        select 1
      `;
    }

    // Cheap, no-cron self-prune: occasionally drop dedup rows older than
    // the trend window needs, so visitor_days stays small forever.
    if (Math.random() < 0.01) {
      await client`delete from visitor_days where day < current_date - interval '35 days'`;
    }
  } catch {
    // Analytics is best-effort; never let a failure here affect the page.
  }
}

// --- Admin dashboard reads -------------------------------------------

export type DailyTrendPoint = { day: string; pageviews: number; uniqueVisitors: number };

export async function getDailyTrend(days = 30): Promise<DailyTrendPoint[]> {
  const rows = (await sql()`
    select day::text as day, pageviews, unique_visitors
    from daily_stats
    where day >= current_date - ${days - 1}::int
    order by day asc
  `) as { day: string; pageviews: number; unique_visitors: number }[];

  // Fill in any missing days (no visits that day) so the chart has a
  // continuous 30-day axis instead of gaps.
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const points: DailyTrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const row = byDay.get(key);
    points.push({
      day: key,
      pageviews: row?.pageviews ?? 0,
      uniqueVisitors: row?.unique_visitors ?? 0,
    });
  }
  return points;
}

export type AnalyticsTotals = {
  pageviewsWindow: number;
  uniqueVisitorDaysWindow: number;
  totalMasjidViews: number;
};

export async function getAnalyticsTotals(days = 30): Promise<AnalyticsTotals> {
  const [windowRows, masjidRows] = await Promise.all([
    sql()`
      select
        coalesce(sum(pageviews), 0) as pageviews,
        coalesce(sum(unique_visitors), 0) as unique_visitors
      from daily_stats
      where day >= current_date - ${days - 1}::int
    `,
    sql()`select coalesce(sum(view_count), 0) as total from masjids`,
  ]) as [{ pageviews: number; unique_visitors: number }[], { total: number }[]];

  return {
    pageviewsWindow: Number(windowRows[0]?.pageviews ?? 0),
    uniqueVisitorDaysWindow: Number(windowRows[0]?.unique_visitors ?? 0),
    totalMasjidViews: Number(masjidRows[0]?.total ?? 0),
  };
}

export type TopMasjid = { id: string; name: string; area: string; viewCount: number };

export async function getTopMasjidsByViews(limit = 15): Promise<TopMasjid[]> {
  const rows = (await sql()`
    select id, name, area, view_count
    from masjids
    where view_count > 0
    order by view_count desc, name asc
    limit ${limit}
  `) as { id: string; name: string; area: string; view_count: number }[];
  return rows.map((r) => ({ id: r.id, name: r.name, area: r.area, viewCount: r.view_count }));
}

export type ReferrerCount = { referrerHost: string; visits: number };

export async function getTopReferrers(days = 30, limit = 10): Promise<ReferrerCount[]> {
  const rows = (await sql()`
    select referrer_host, sum(visits) as visits
    from referrer_stats
    where day >= current_date - ${days - 1}::int
    group by referrer_host
    order by visits desc
    limit ${limit}
  `) as { referrer_host: string; visits: number }[];
  return rows.map((r) => ({ referrerHost: r.referrer_host, visits: Number(r.visits) }));
}

export type DeviceCount = { deviceType: string; visits: number };

export async function getDeviceSplit(days = 30): Promise<DeviceCount[]> {
  const rows = (await sql()`
    select device_type, sum(visits) as visits
    from device_stats
    where day >= current_date - ${days - 1}::int
    group by device_type
    order by device_type asc
  `) as { device_type: string; visits: number }[];
  return rows.map((r) => ({ deviceType: r.device_type, visits: Number(r.visits) }));
}
