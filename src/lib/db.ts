import { neon } from "@neondatabase/serverless";

let sqlClient: ReturnType<typeof neon> | null = null;

export function sql() {
  if (!sqlClient) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env.local (Neon connection string)."
      );
    }
    sqlClient = neon(url);
  }
  return sqlClient;
}

/**
 * Retries a DB call (with backoff) if it fails with a transient network
 * error — a DNS blip, brief connectivity loss, or (common on Neon's free
 * tier) the compute having auto-suspended and needing a few seconds to
 * wake back up on the next query. Non-network errors (bad SQL, constraint
 * violations) are not retried.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  delaysMs: number[] = [500, 1500, 3000]
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= delaysMs.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransientNetworkError(err) || attempt === delaysMs.length) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delaysMs[attempt]));
    }
  }
  throw lastErr;
}

function isTransientNetworkError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("fetch failed") ||
    message.includes("ENOTFOUND") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT") ||
    message.includes("EAI_AGAIN")
  );
}
