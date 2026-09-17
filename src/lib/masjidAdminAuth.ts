import "server-only";
import {
  SESSION_MAX_AGE_SECONDS,
  createSignedCookieValue,
  hexToBytes,
  timingSafeStringEqual,
  toHex,
  verifySignedCookieValue,
} from "./session";

// Session + password handling for per-masjid sub-admins. Kept separate
// from adminAuth.ts (the super admin) so the two account types can never
// be confused with each other — a sub-admin session can never satisfy a
// super-admin check or vice versa, even by accident.
//
// Built on Web Crypto only (no bcrypt/node:crypto), so this module stays
// importable from middleware (Edge runtime) as well as server actions.

const COOKIE_NAME = "qareeb_masjid_admin_session";
const PBKDF2_ITERATIONS = 100_000;

export const MASJID_ADMIN_COOKIE_NAME = COOKIE_NAME;
export const MASJID_ADMIN_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;

export type MasjidAdminSession = {
  role: "masjid";
  masjidAdminId: string;
  masjidId: string;
  username: string;
};

export async function createMasjidAdminSessionCookieValue(
  session: Omit<MasjidAdminSession, "role">
): Promise<string> {
  return createSignedCookieValue<MasjidAdminSession>({ role: "masjid", ...session });
}

/** Pure signature/expiry check — no DB call, safe to use from middleware. */
export async function getMasjidAdminSession(
  value: string | undefined
): Promise<MasjidAdminSession | null> {
  const session = await verifySignedCookieValue<MasjidAdminSession>(value);
  return session?.role === "masjid" ? session : null;
}

async function deriveHashHex(password: string, saltBytes: Uint8Array): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes.slice().buffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return toHex(bits);
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveHashHex(password, saltBytes);
  return { hash, salt: toHex(saltBytes.buffer as ArrayBuffer) };
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string
): Promise<boolean> {
  const candidate = await deriveHashHex(password, hexToBytes(salt));
  return timingSafeStringEqual(candidate, hash);
}
