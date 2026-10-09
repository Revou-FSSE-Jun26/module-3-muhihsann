import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/api";

export const metadata = {
  title: "Home",
  description: "RevOnest — everyday essentials across electronics, kitchen, books, and sports.",
};

// Pure Server Component: fetches products and renders the first 5 as
// read-only cards (no cart actions on the home page).
export default async function HomePage() {
  const products = await getProducts();
  const featured = products.slice(0, 5);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
          Everyday Essentials
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Welcome to Rev<span className="text-amber-600">Onest</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-stone-600">
          Everything you need across electronics, kitchen, books, and sports —
          quality picks at fair prices, delivered to your door.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
          >
            Browse all products
          </Link>
          <Link
            href="/categories"
            className="rounded-xl border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
          >
            Shop by category
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured products</h2>
          <Link
            href="/products"
            className="text-sm font-semibold text-amber-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        {/* Read-only cards on the home page (showActions={false}). */}
        <ProductGrid products={featured} showActions={false} />
      </section>
    </>
  );
}
