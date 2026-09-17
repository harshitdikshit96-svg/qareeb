import "server-only";
import {
  SESSION_MAX_AGE_SECONDS,
  createSignedCookieValue,
  timingSafeStringEqual,
  verifySignedCookieValue,
} from "./session";

const COOKIE_NAME = "qareeb_admin_session";

type SuperAdminSession = { role: "super" };

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeStringEqual(candidate, expected);
}

export async function createSessionCookieValue(): Promise<string> {
  return createSignedCookieValue<SuperAdminSession>({ role: "super" });
}

export async function isValidSessionCookieValue(
  value: string | undefined
): Promise<boolean> {
  const session = await verifySignedCookieValue<SuperAdminSession>(value);
  return session?.role === "super";
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;
