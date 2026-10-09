export default function OrdersLoading() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-stone-200" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-stone-200 bg-stone-100"
          />
        ))}
      </div>
    </section>
  );
}
