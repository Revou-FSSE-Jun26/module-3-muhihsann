"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/Card";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/ui";

/**
 * Dedicated checkout page. Shows an order summary built from the cart, then
 * confirms the order via POST /orders (through CartContext.checkout), clears
 * the cart, and redirects to /orders.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, total, checkout } = useCart();

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const empty = items.length === 0;

  async function handlePlaceOrder() {
    if (!user) {
      router.push("/login");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      await checkout();
      router.push("/orders");
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) setError(err.message);
      else setError("Checkout failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  // Not logged in: orders are per-user, so require login.
  if (!authLoading && !user) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Checkout
        </h1>
        <p className="text-stone-500">
          Please{" "}
          <Link
            href="/login"
            className="font-semibold text-amber-700 hover:underline"
          >
            log in
          </Link>{" "}
          to complete your order.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Checkout
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {empty ? (
        <Card className="p-8 text-center">
          <p className="text-stone-500">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Browse products
          </Link>
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="mb-4 font-bold text-stone-900">Order summary</h2>
          <ul className="divide-y divide-stone-100">
            {items.map((line) => (
              <li
                key={line.product.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-stone-900">
                    {line.product.name}
                  </p>
                  <p className="text-sm text-stone-500">
                    {formatPrice(line.product.price)} × {line.quantity}
                  </p>
                </div>
                <p className="font-bold text-stone-900">
                  {formatPrice(line.product.price * line.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
            <span className="font-semibold text-stone-600">Total</span>
            <span className="text-2xl font-extrabold text-stone-900">
              {formatPrice(total)}
            </span>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              href="/cart"
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400"
            >
              Back to cart
            </Link>
            <button
              onClick={handlePlaceOrder}
              disabled={placing || empty}
              className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placing ? "Placing order…" : "Place order"}
            </button>
          </div>
        </Card>
      )}
    </section>
  );
}
