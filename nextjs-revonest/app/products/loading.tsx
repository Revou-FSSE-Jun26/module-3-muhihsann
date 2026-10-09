// Skeleton UI shown while the products Server Component fetch is in flight.
export default function ProductsLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-64 animate-pulse rounded bg-stone-200" />
      <div className="mb-6 h-12 w-full animate-pulse rounded-xl bg-stone-200" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-2xl border border-stone-200 bg-stone-100"
          />
        ))}
      </div>
    </div>
  );
}
