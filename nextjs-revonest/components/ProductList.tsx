"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import AddProductForm from "@/components/AddProductForm";
import Card from "@/components/Card";
import { getProducts } from "@/lib/api";
import { formatPrice } from "@/lib/ui";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/lib/types";

interface ProductListProps {
  /** Products fetched on the server for the first paint. */
  initialProducts: Product[];
}

/**
 * Client catalog for /products:
 * - renders products from state (seeded by the server)
 * - SearchBar navigates to /products?search=<q> on Enter
 * - a useEffect reads useSearchParams() and refetches
 *   GET /products?search=<q> whenever the query changes
 * - CategoryFilter refetches GET /products?category_id=<id> on selection
 * - "Add to cart" updates cart state immutably; summary shows count + total
 * - AddProductForm appends new products immutably (spread pattern)
 */
export default function ProductList({ initialProducts }: ProductListProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";

  const { addItem, count: cartCount, total: cartTotal } = useCart();
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [category, setCategory] = useState<number | "all">("all");
  const [loading, setLoading] = useState(false);
  // Skip the first refetch — the server already handed us initialProducts.
  const firstRun = useRef(true);

  // Refetch whenever the URL search query or selected category changes.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    let active = true;
    setLoading(true);
    getProducts({
      search: searchQuery || undefined,
      category_id: category === "all" ? undefined : category,
    })
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch(() => {
        // Keep the current list on a transient error rather than blanking it.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [searchQuery, category]);

  // Add to the shared, per-user cart (CartContext).
  function handleAddToCart(product: Product, quantity: number) {
    addItem(product, quantity);
  }

  // Immutable append of a new product (spread pattern).
  function handleAddProduct(product: Product) {
    setProducts((prev) => [product, ...prev]);
  }

  return (
    <div className="space-y-6">
      {/* Controls + cart summary */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar
              navigateOnEnter
              placeholder="Search products, then press Enter..."
            />
          </div>
          <CategoryFilter value={category} onChange={setCategory} />
        </div>
        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
          <span aria-hidden="true">🛒</span>
          <span>{cartCount}</span>
          <span className="text-amber-400">·</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>
      </div>

      {searchQuery && (
        <p className="text-sm text-stone-500">
          Showing results for{" "}
          <span className="font-semibold text-stone-700">
            &ldquo;{searchQuery}&rdquo;
          </span>
        </p>
      )}

      <div
        className={`grid gap-6 ${
          isAdmin ? "lg:grid-cols-[1fr_320px]" : "grid-cols-1"
        }`}
      >
        <div>
          {loading ? (
            <p className="py-16 text-center text-stone-500">Loading products…</p>
          ) : (
            <ProductGrid products={products} onAddToCart={handleAddToCart} />
          )}
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
