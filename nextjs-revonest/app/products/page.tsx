import { Suspense } from "react";
import ProductList from "@/components/ProductList";
import { getProducts } from "@/lib/api";

export const metadata = {
  title: "Products",
  description: "Browse the full RevOnest catalog with live search and category filters.",
};

// Server Component: fetches the initial product list, then hands it to the
// ProductList client component for interactivity.
export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Shop the RevOnest Catalog
      </h1>
      {/* useSearchParams in ProductList requires a Suspense boundary. */}
      <Suspense fallback={<p className="text-stone-500">Loading…</p>}>
        <ProductList initialProducts={products} />
      </Suspense>
    </>
  );
}
