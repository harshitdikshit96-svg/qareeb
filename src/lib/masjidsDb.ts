import "server-only";
import { sql, withRetry } from "./db";
import type { Masjid, MasjidInput } from "./types";

type Row = {
  id: string;
  name: string;
  area: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  geo_precision: "exact" | "locality" | null;
  verified: boolean;
  images: string[] | null;
  fajr: string;
  zohar: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah: string;
  last_updated: string;
};

function rowToMasjid(r: Row): Masjid {
  return {
    id: r.id,
    name: r.name,
    area: r.area,
    address: r.address,
    city: r.city,
    lat: r.lat,
    lng: r.lng,
    geoPrecision: r.geo_precision,
    verified: r.verified,
    images: r.images ?? [],
    timings: {
      fajr: r.fajr,
      zohar: r.zohar,
      asr: r.asr,
      maghrib: r.maghrib,
      isha: r.isha,
      jummah: r.jummah,
    },
    lastUpdated:
      typeof r.last_updated === "string"
        ? r.last_updated.slice(0, 10)
        : r.last_updated,
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getAllMasjidsFromDb(): Promise<Masjid[]> {
  const rows = (await withRetry(() =>
    sql()`select * from masjids order by area, name`
  )) as Row[];
  return rows.map(rowToMasjid);
}

export async function getMasjidByIdFromDb(id: string): Promise<Masjid | null> {
  const rows = (await withRetry(() =>
    sql()`select * from masjids where id = ${id}`
  )) as Row[];
  return rows[0] ? rowToMasjid(rows[0]) : null;
}

export async function createMasjidInDb(input: MasjidInput): Promise<Masjid> {
  const id = input.id?.trim() || slugify(input.name);
  const rows = (await withRetry(() =>
    sql()`
    insert into masjids
      (id, name, area, address, city, lat, lng, geo_precision, verified,
       fajr, zohar, asr, maghrib, isha, jummah, last_updated, updated_at)
    values
      (${id}, ${input.name}, ${input.area}, ${input.address}, ${input.city},
       ${input.lat}, ${input.lng}, ${input.geoPrecision}, ${input.verified},
       ${input.timings.fajr}, ${input.timings.zohar}, ${input.timings.asr},
       ${input.timings.maghrib}, ${input.timings.isha}, ${input.timings.jummah},
       current_date, now())
    returning *
  `
  )) as Row[];
  return rowToMasjid(rows[0]);
}

export async function updateMasjidInDb(
  id: string,
  input: MasjidInput
): Promise<Masjid> {
  const rows = (await withRetry(() =>
    sql()`
    update masjids set
      name = ${input.name},
      area = ${input.area},
      address = ${input.address},
      city = ${input.city},
      lat = ${input.lat},
      lng = ${input.lng},
      geo_precision = ${input.geoPrecision},
      verified = ${input.verified},
      fajr = ${input.timings.fajr},
      zohar = ${input.timings.zohar},
      asr = ${input.timings.asr},
      maghrib = ${input.timings.maghrib},
      isha = ${input.timings.isha},
      jummah = ${input.timings.jummah},
      last_updated = current_date,
      updated_at = now()
    where id = ${id}
    returning *
  `
  )) as Row[];
  if (!rows[0]) {
    throw new Error(`Masjid with id "${id}" not found`);
  }
  return rowToMasjid(rows[0]);
}

export async function deleteMasjidFromDb(id: string): Promise<void> {
  await withRetry(() => sql()`delete from masjids where id = ${id}`);
}

export async function addMasjidImageInDb(
  id: string,
  imagePath: string
): Promise<Masjid> {
  const rows = (await withRetry(() =>
    sql()`
    update masjids
    set images = array_append(images, ${imagePath}), updated_at = now()
    where id = ${id}
    returning *
  `
  )) as Row[];
  if (!rows[0]) {
    throw new Error(`Masjid with id "${id}" not found`);
  }
  return rowToMasjid(rows[0]);
}

export async function removeMasjidImageInDb(
  id: string,
  imagePath: string
): Promise<Masjid> {
  const rows = (await withRetry(() =>
    sql()`
    update masjids
    set images = array_remove(images, ${imagePath}), updated_at = now()
    where id = ${id}
    returning *
  `
  )) as Row[];
  if (!rows[0]) {
    throw new Error(`Masjid with id "${id}" not found`);
  }
  return rowToMasjid(rows[0]);
}
