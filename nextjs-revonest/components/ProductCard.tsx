"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Card from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { getButtonClasses, formatPrice } from "@/lib/ui";
import { productImage } from "@/lib/productImages";
import type { ProductCardProps } from "@/lib/types";

/**
 * ProductCard — renders a single typed Product.
 * Optional props use destructuring defaults:
 *   - showActions (default true): hides the counter + button when false
 *     (e.g. read-only cards on the home page)
 *   - initialQuantity (default 1): starting value of the quantity counter
 *   - onAddToCart: callback invoked with (product, quantity) on add
 */
export default function ProductCard({
  product,
  showActions = true,
  initialQuantity = 1,
  onAddToCart,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const { isAdmin, loading: authLoading } = useAuth();

  const inStock = product.stock_quantity > 0;
  // Admins manage the catalog but don't shop, so they get no cart controls.
  // Gated on authLoading so the server and first client render match.
  const adminView = !authLoading && isAdmin;

  return (
    <Card className="flex h-full flex-col p-5">
      {/* Product image (resolved by name; falls back to a named placeholder). */}
      <div className="relative mb-4 aspect-[3/2] w-full overflow-hidden rounded-xl bg-stone-100">
        <Image
          src={productImage(product.name)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      {/* Header: name + stock badge (conditional rendering on stock state) */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-stone-900">{product.name}</h3>
        {inStock ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            In stock
          </span>
        ) : (
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
            Out of stock
          </span>
        )}
      </div>

      <p className="mb-3 text-sm text-stone-500">{product.description}</p>

      <p className="mb-4 text-xl font-extrabold text-stone-900">
        {formatPrice(product.price)}
      </p>

      {/* Admins: link to the dashboard instead of shopping controls. */}
      {showActions && adminView && (
        <Link
          href="/dashboard/products"
          className="mt-auto block rounded-lg border border-stone-300 px-4 py-2 text-center text-sm font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
        >
          Manage in dashboard
        </Link>
      )}

      {/* Shopping actions (customers and visitors) */}
      {showActions && !adminView && (
        <div className="mt-auto space-y-3">
          {/* Quantity counter — disabled when out of stock */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-stone-600">Qty</span>
            <div className="flex items-center rounded-lg border border-stone-300">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={!inStock || quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 text-lg font-semibold text-stone-600 disabled:cursor-not-allowed disabled:text-stone-300"
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={!inStock || quantity >= product.stock_quantity}
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock_quantity, q + 1))
                }
                className="px-3 py-1 text-lg font-semibold text-stone-600 disabled:cursor-not-allowed disabled:text-stone-300"
              >
                +
              </button>
            </div>
          </div>

          {/* Add-to-cart button: classes + label driven by stock state */}
          <button
            type="button"
            disabled={!inStock}
            onClick={() => onAddToCart?.(product, quantity)}
            className={getButtonClasses(inStock)}
          >
            {inStock ? "Add to cart" : "Unavailable"}
          </button>
        </div>
      )}
    </Card>
  );
}
