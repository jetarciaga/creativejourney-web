"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="bg-bg py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-text">
          Something went wrong
        </h2>
        <p className="mt-4 text-base text-muted">
          The admin area could not load. Please try again.
        </p>
        <button
          className="mt-8 min-h-[var(--site-tap-min)] rounded-md bg-accent-fill px-5 py-3 text-sm font-semibold !text-white transition hover:bg-green-700"
          onClick={() => retry()}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
