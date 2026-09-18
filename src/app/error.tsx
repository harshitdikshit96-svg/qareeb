"use client";

import { useEffect } from "react";
import { useDictionary } from "@/lib/i18n/LocaleContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = useDictionary();

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
          {isNetworkIssue ? dict.errorPage.connectionHiccup : dict.errorPage.somethingWrong}
        </h1>
        <p className="text-sm text-muted">
          {isNetworkIssue ? dict.errorPage.networkDescription : dict.errorPage.genericDescription}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-brand text-white text-sm font-medium px-4 py-2"
        >
          {dict.errorPage.tryAgain}
        </button>
      </div>
    </div>
  );
}
