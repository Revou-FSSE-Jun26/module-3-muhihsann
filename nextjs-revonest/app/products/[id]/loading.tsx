export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
      <div className="mt-4 space-y-4 rounded-2xl border border-stone-200 bg-white p-8">
        <div className="h-8 w-2/3 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
        <div className="h-10 w-32 animate-pulse rounded bg-stone-200" />
      </div>
    </div>
  );
}
