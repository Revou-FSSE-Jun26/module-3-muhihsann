"use client";

import Link from "next/link";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
      <p className="text-3xl">⚠️</p>
      <h2 className="mt-2 text-lg font-bold text-rose-800">
        Couldn&apos;t load this product
      </h2>
      <p className="mt-1 text-sm text-rose-700">
        It may not exist, or the store API didn&apos;t respond.
      </p>
      <p className="mt-2 text-xs text-rose-500">{error.message}</p>
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={reset}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          Try again
        </button>
        <Link
          href="/products"
          className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          Back to products
        </Link>
      </div>
    </div>
  );
}
