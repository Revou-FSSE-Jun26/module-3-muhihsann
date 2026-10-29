"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import AddProductForm from "@/components/AddProductForm";
import Card from "@/components/Card";
import { getProducts } from "@/lib/api";
import { formatPrice } from "@/lib/ui";
import { filterProducts, parseCategoryParam } from "@/lib/filters";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/lib/types";

interface ProductListProps {
  /** Products fetched on the server for the first paint. */
  initialProducts: Product[];
}

/** How long to wait after the last keystroke before writing search to the URL. */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Client catalog for /products.
 *
 * The URL is the source of truth for both filters:
 *   /products?search=<name>&category=<id>
 * so filtered views are shareable and the category cards on /categories can
 * link straight to a filtered list.
 *
 * - Typing in the SearchBar filters the list instantly (live), then writes the
 *   query to the URL after a short debounce.
 * - Choosing a category writes ?category= to the URL immediately.
 * - Whenever the URL filters change, products are refetched from the API.
 *   The API ignores these params, so filterProducts() applies them here.
 */
export default function ProductList({ initialProducts }: ProductListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";
  const categoryId = parseCategoryParam(searchParams.get("category"));

  const { addItem, count: cartCount, total: cartTotal } = useCart();
  const { user, isAdmin } = useAuth();
  const isCustomer = user?.role === "customer";

  const [products, setProducts] = useState<Product[]>(initialProducts);
  // Live value of the search box (may run ahead of the URL while typing).
  const [query, setQuery] = useState(urlSearch);
  // The last search value this component wrote to the URL. Used to tell our
  // own URL updates apart from outside navigation (back/forward, links).
  const lastWritten = useRef(urlSearch);
  // Skip the first refetch — the server already handed us initialProducts.
  const firstRun = useRef(true);

  /** Build a /products URL from the given filter values. */
  function buildUrl(search: string, category: number | undefined) {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category !== undefined) params.set("category", String(category));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  // If the URL search changes from outside (back/forward, a link), reflect it
  // in the search box. Ignore the changes we wrote ourselves.
  useEffect(() => {
    if (urlSearch !== lastWritten.current) {
      lastWritten.current = urlSearch;
      setQuery(urlSearch);
    }
  }, [urlSearch]);

  // Write the typed search to the URL once the user pauses typing.
  useEffect(() => {
    if (query.trim() === urlSearch.trim()) return;
    const timer = setTimeout(() => {
      lastWritten.current = query.trim();
      router.replace(buildUrl(query, categoryId), { scroll: false });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // buildUrl only depends on pathname, which is stable on this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, urlSearch, categoryId, router]);

  // Refetch from the API whenever the URL filters change.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    let active = true;
    getProducts({ search: urlSearch || undefined, category_id: categoryId })
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch(() => {
        // Keep the current list on a transient error rather than blanking it.
      });
    return () => {
      active = false;
    };
  }, [urlSearch, categoryId]);

  // What's actually rendered: live search + URL category, applied client-side.
  const visible = useMemo(
    () => filterProducts(products, { search: query, categoryId }),
    [products, query, categoryId]
  );

  function handleCategoryChange(next: number | "all") {
    const nextCategory = next === "all" ? undefined : next;
    lastWritten.current = query.trim();
    router.replace(buildUrl(query, nextCategory), { scroll: false });
  }

  function clearFilters() {
    setQuery("");
    lastWritten.current = "";
    router.replace(pathname, { scroll: false });
  }

  // Add to the shared, per-user cart (CartContext).
  function handleAddToCart(product: Product, quantity: number) {
    addItem(product, quantity);
  }

  // Immutable append of a new product (spread pattern).
  function handleAddProduct(product: Product) {
    setProducts((prev) => [product, ...prev]);
  }

  const filtersActive = query.trim() !== "" || categoryId !== undefined;

  return (
    <div className="space-y-6">
      {/* Controls + cart summary */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search products by name..."
            />
          </div>
          <CategoryFilter
            value={categoryId ?? "all"}
            onChange={handleCategoryChange}
          />
        </div>
        {/* Cart summary — customers only (guests and admins don't shop). */}
        {isCustomer && (
          <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
            <span aria-hidden="true">🛒</span>
            <span>{cartCount}</span>
            <span className="text-amber-400">·</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
        )}
      </div>

      {filtersActive && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
          <p>
            Showing{" "}
            <span className="font-semibold text-stone-700">
              {visible.length}
            </span>{" "}
            product{visible.length === 1 ? "" : "s"}
            {query.trim() && (
              <>
                {" "}
                matching{" "}
                <span className="font-semibold text-stone-700">
                  &ldquo;{query.trim()}&rdquo;
                </span>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="font-semibold text-amber-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      <div
        className={`grid gap-6 ${
          isAdmin ? "lg:grid-cols-[1fr_320px]" : "grid-cols-1"
        }`}
      >
        <div>
          <ProductGrid products={visible} onAddToCart={handleAddToCart} />
        </div>
        {/* Only admins manage products; ordinary customers don't see this. */}
        {isAdmin && (
          <aside>
            <Card className="p-5">
              <AddProductForm onAdd={handleAddProduct} />
            </Card>
          </aside>
        )}
      </div>
    </div>
  );
}
