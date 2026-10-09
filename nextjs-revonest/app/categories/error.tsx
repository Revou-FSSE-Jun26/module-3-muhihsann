"use client";

export default function CategoriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-3xl">⚠️</p>
        <h2 className="mt-2 text-lg font-bold text-rose-800">
          Couldn&apos;t load categories
        </h2>
        <p className="mt-1 text-sm text-rose-700">
          The store API didn&apos;t respond. Please try again in a moment.
        </p>
        <p className="mt-2 text-xs text-rose-500">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
