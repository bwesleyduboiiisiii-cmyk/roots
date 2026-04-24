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

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="polaroid max-w-md w-full" style={{ transform: "rotate(0deg)", padding: "24px" }}>
        <h2 className="font-serif text-2xl mb-2">Something went sideways</h2>
        <p className="text-sm text-ink/80 mb-3">
          {error.message || "An unexpected error occurred"}
        </p>
        {error.digest && (
          <p className="text-xs text-sepia/60 mb-4">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="w-full py-2 bg-sepia text-white rounded hover:bg-ink transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
