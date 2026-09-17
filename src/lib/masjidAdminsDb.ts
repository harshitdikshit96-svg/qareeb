import "server-only";
import { sql, withRetry } from "./db";
import { hashPassword } from "./masjidAdminAuth";
import type { MasjidAdmin, PrayerTimes, TimingChangeLogEntry } from "./types";

type AdminRow = {
  id: string;
  masjid_id: string;
  username: string;
  password_hash: string;
  password_salt: string;
  created_at: string | Date;
};

function formatDateTimeValue(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

function rowToMasjidAdmin(r: AdminRow): MasjidAdmin {
  return {
    id: r.id,
    masjidId: r.masjid_id,
    username: r.username,
    createdAt: formatDateTimeValue(r.created_at),
  };
}

export async function getMasjidAdminsForMasjid(masjidId: string): Promise<MasjidAdmin[]> {
  const rows = (await withRetry(() =>
    sql()`select * from masjid_admins where masjid_id = ${masjidId} order by created_at asc`
  )) as AdminRow[];
  return rows.map(rowToMasjidAdmin);
}

export type MasjidAdminCredentials = {
  id: string;
  masjidId: string;
  username: string;
  passwordHash: string;
  passwordSalt: string;
};

export async function getMasjidAdminCredentialsByUsername(
  username: string
): Promise<MasjidAdminCredentials | null> {
  const rows = (await withRetry(() =>
    sql()`select * from masjid_admins where username = ${username}`
  )) as AdminRow[];
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id,
    masjidId: r.masjid_id,
    username: r.username,
    passwordHash: r.password_hash,
    passwordSalt: r.password_salt,
  };
}

export async function createMasjidAdmin(
  masjidId: string,
  username: string,
  password: string
): Promise<MasjidAdmin> {
  const { hash, salt } = await hashPassword(password);
  const id = crypto.randomUUID();
  try {
    const rows = (await withRetry(() =>
      sql()`
        insert into masjid_admins (id, masjid_id, username, password_hash, password_salt)
        values (${id}, ${masjidId}, ${username}, ${hash}, ${salt})
        returning *
      `
    )) as AdminRow[];
    return rowToMasjidAdmin(rows[0]);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "23505") {
      throw new Error(`Username "${username}" is already taken.`);
    }
    throw err;
  }
}

export async function deleteMasjidAdmin(id: string): Promise<void> {
  await withRetry(() => sql()`delete from masjid_admins where id = ${id}`);
}

export async function resetMasjidAdminPassword(
  id: string,
  newPassword: string
): Promise<void> {
  const { hash, salt } = await hashPassword(newPassword);
  await withRetry(
    () => sql()`
      update masjid_admins
      set password_hash = ${hash}, password_salt = ${salt}, updated_at = now()
      where id = ${id}
    `
  );
}

type LogRow = {
  id: number;
  masjid_id: string;
  changed_by: string;
  old_timings: PrayerTimes;
  new_timings: PrayerTimes;
  changed_at: string | Date;
};

function rowToLogEntry(r: LogRow): TimingChangeLogEntry {
  return {
    id: r.id,
    masjidId: r.masjid_id,
    changedBy: r.changed_by,
    oldTimings: r.old_timings,
    newTimings: r.new_timings,
    changedAt: formatDateTimeValue(r.changed_at),
  };
}

export async function logTimingChange(
  masjidId: string,
  changedBy: string,
  oldTimings: PrayerTimes,
  newTimings: PrayerTimes
): Promise<void> {
  await withRetry(
    () => sql()`
      insert into timing_change_log (masjid_id, changed_by, old_timings, new_timings)
      values (${masjidId}, ${changedBy}, ${JSON.stringify(oldTimings)}::jsonb, ${JSON.stringify(newTimings)}::jsonb)
    `
  );
}

export async function getRecentTimingChanges(
  masjidId: string,
  limit = 10
): Promise<TimingChangeLogEntry[]> {
  const rows = (await withRetry(
    () => sql()`
      select * from timing_change_log
      where masjid_id = ${masjidId}
      order by changed_at desc
      limit ${limit}
    `
  )) as LogRow[];
  return rows.map(rowToLogEntry);
}
