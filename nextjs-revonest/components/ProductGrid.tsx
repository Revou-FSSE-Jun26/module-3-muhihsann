import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  /** Forwarded to each ProductCard (e.g. read-only cards on the home page). */
  showActions?: boolean;
  onAddToCart?: (product: Product, quantity: number) => void;
}

/**
 * Renders a responsive, mobile-first grid of ProductCards from a typed
 * Product[] — a single .map(), no hardcoded card instances.
 */
export default function ProductGrid({
  products,
  showActions = true,
  onAddToCart,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-stone-500">No products found.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showActions={showActions}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
