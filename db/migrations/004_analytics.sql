-- Per-masjid view counter, bumped on every detail-page visit.
alter table masjids add column if not exists view_count integer not null default 0;

-- One row per calendar day: the running totals the admin dashboard reads.
create table if not exists daily_stats (
  day date primary key,
  pageviews integer not null default 0,
  unique_visitors integer not null default 0
);

-- Dedup table backing the unique_visitors counter above: one row per
-- (anonymous visitor, day), just so a repeat visit the same day doesn't
-- get counted twice. Kept tiny by a self-pruning delete in application
-- code (rows older than ~35 days are dropped periodically) rather than a
-- separate scheduled job.
create table if not exists visitor_days (
  visitor_id text not null,
  day date not null,
  primary key (visitor_id, day)
);

-- Where visits came from, per day.
create table if not exists referrer_stats (
  day date not null,
  referrer_host text not null,
  visits integer not null default 0,
  primary key (day, referrer_host)
);

-- Mobile vs desktop split, per day.
create table if not exists device_stats (
  day date not null,
  device_type text not null,
  visits integer not null default 0,
  primary key (day, device_type)
);
