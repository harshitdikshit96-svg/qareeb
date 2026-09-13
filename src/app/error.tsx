"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isNetworkIssue = /fetch failed|ENOTFOUND|ECONNRESET|ETIMEDOUT/i.test(
    error.message
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm text-center space-y-3">
        <h1 className="text-lg font-semibold">
          {isNetworkIssue ? "Connection hiccup" : "Something went wrong"}
        </h1>
        <p className="text-sm text-muted">
          {isNetworkIssue
            ? "Couldn't reach the database — this usually clears up on its own after a moment (common right after your device reconnects to the internet)."
            : "An unexpected error occurred while loading this page."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-brand text-white text-sm font-medium px-4 py-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
