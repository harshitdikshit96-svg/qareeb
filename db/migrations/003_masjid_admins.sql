-- Per-masjid sub-admin accounts. Each sub-admin belongs to exactly one
-- masjid and can only update that masjid's prayer timings (enforced in
-- application code, not here).
create table if not exists masjid_admins (
  id text primary key,
  masjid_id text not null references masjids(id) on delete cascade,
  username text not null unique,
  password_hash text not null,
  password_salt text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists masjid_admins_masjid_idx on masjid_admins (masjid_id);

-- Audit trail of every timing change, by whichever account made it
-- ("super:admin" for the super admin, or a sub-admin's username).
create table if not exists timing_change_log (
  id bigserial primary key,
  masjid_id text not null references masjids(id) on delete cascade,
  changed_by text not null,
  old_timings jsonb not null,
  new_timings jsonb not null,
  changed_at timestamptz not null default now()
);
create index if not exists timing_change_log_masjid_idx on timing_change_log (masjid_id, changed_at desc);
