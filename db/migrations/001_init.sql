create table if not exists masjids (
  id text primary key,
  name text not null,
  area text not null,
  address text not null,
  city text not null default 'Lucknow',
  lat double precision,
  lng double precision,
  geo_precision text check (geo_precision in ('exact', 'locality')),
  verified boolean not null default false,
  image_url text,
  fajr text not null default '',
  zohar text not null default '',
  asr text not null default '',
  maghrib text not null default '',
  isha text not null default '',
  jummah text not null default '',
  last_updated date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists masjids_area_idx on masjids (area);
