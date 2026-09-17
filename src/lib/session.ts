import "server-only";

// Shared signed-cookie helpers used by both the super-admin session
// (adminAuth.ts) and the per-masjid sub-admin session (masjidAdminAuth.ts).
// Built entirely on Web Crypto + btoa/atob so it works unchanged in both
// the Node runtime (server actions) and the Edge runtime (middleware).

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

export function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function hmacSign(value: string): Promise<string> {
  const key = await importHmacKey(getSecret());
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(sig);
}

export function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Signs an arbitrary JSON-serializable payload into a tamper-proof cookie value with an expiry. */
export async function createSignedCookieValue<T>(
  payload: T,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS
): Promise<string> {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const body = `${encodedPayload}.${expiresAt}`;
  const sig = await hmacSign(body);
  return `${body}.${sig}`;
}

/** Verifies a cookie value produced by createSignedCookieValue and returns its payload, or null if invalid/expired/tampered. */
export async function verifySignedCookieValue<T>(
  value: string | undefined
): Promise<T | null> {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [encodedPayload, expiresAtRaw, sig] = parts;
  const body = `${encodedPayload}.${expiresAtRaw}`;
  const expected = await hmacSign(body);
  if (!timingSafeStringEqual(expected, sig)) return null;
  const expiresAt = parseInt(expiresAtRaw, 10);
  if (Number.isNaN(expiresAt) || Date.now() >= expiresAt) return null;
  try {
    return JSON.parse(fromBase64Url(encodedPayload)) as T;
  } catch {
    return null;
  }
}
