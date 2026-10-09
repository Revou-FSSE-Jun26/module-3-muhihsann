"use client";

import { useMemo, useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import AddProductForm from "@/components/AddProductForm";
import Card from "@/components/Card";
import { formatPrice } from "@/lib/ui";
import type { Product } from "@/lib/types";

interface ProductListProps {
  /** Initial products (later provided by the Server Component / API). */
  initialProducts: Product[];
}

/** A line in the cart: the product plus how many were added. */
interface CartLine {
  product: Product;
  quantity: number;
}

/**
 * The full interactive catalog exercise:
 * - renders the product list from state
 * - live search filters the list
 * - "Add to cart" updates cart state immutably
 * - cart summary shows item count + total
 * - AddProductForm appends new products immutably (spread pattern)
 */
export default function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);

  // Live-filtered view derived from products + search term.
  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }, [products, search]);

  // Immutable add-to-cart: never mutate existing state.
  function handleAddToCart(product: Product, quantity: number) {
    setCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: line.quantity + quantity }
            : line
        );
      }
      return [...prev, { product, quantity }];
    });
  }

  // Immutable append of a brand-new product (spread pattern).
  function handleAddProduct(product: Product) {
    setProducts((prev) => [product, ...prev]);
  }

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Search + cart summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
          <span aria-hidden="true">🛒</span>
          <span>{cartCount}</span>
          <span className="text-amber-400">·</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Product grid */}
        <div>
          <ProductGrid products={visibleProducts} onAddToCart={handleAddToCart} />
        </div>

        {/* Add-product form in a Card */}
        <aside>
          <Card className="p-5">
            <AddProductForm onAdd={handleAddProduct} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
