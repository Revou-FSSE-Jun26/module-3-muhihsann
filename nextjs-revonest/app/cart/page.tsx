"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/Card";
import RouteGuard from "@/components/RouteGuard";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/ui";

// Customers only: logged-out visitors go to /login, admins to /dashboard.
export default function CartPage() {
  return (
    <RouteGuard requireRole="customer" redirectTo="/dashboard">
      <CartContent />
    </RouteGuard>
  );
}

function CartContent() {
  const router = useRouter();
  const { items, total, updateQuantity, removeItem, clear } = useCart();

  function handleCheckout() {
    router.push("/checkout");
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Your Cart
      </h1>

      {items.length === 0 ? (
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
        <>
          <div className="space-y-3">
            {items.map((line) => (
              <Card
                key={line.product.id}
                className="flex items-center justify-between gap-4 p-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-stone-900">
                    {line.product.name}
                  </p>
                  <p className="text-sm text-stone-500">
                    {formatPrice(line.product.price)} each
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-lg border border-stone-300">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() =>
                        updateQuantity(line.product.id, line.quantity - 1)
                      }
                      className="px-3 py-1 text-lg font-semibold text-stone-600 hover:text-amber-700"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold">
                      {line.quantity}
                    </span>
                    <button
                      aria-label="Increase quantity"
                      disabled={line.quantity >= line.product.stock_quantity}
                      onClick={() =>
                        updateQuantity(line.product.id, line.quantity + 1)
                      }
                      className="px-3 py-1 text-lg font-semibold text-stone-600 hover:text-amber-700 disabled:cursor-not-allowed disabled:text-stone-300"
                    >
                      +
                    </button>
                  </div>

                  <p className="min-w-20 text-right font-extrabold text-stone-900">
                    {formatPrice(line.product.price * line.quantity)}
                  </p>

                  <button
                    onClick={() => removeItem(line.product.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-6 p-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-600">Total</span>
              <span className="text-2xl font-extrabold text-stone-900">
                {formatPrice(total)}
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={clear}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400"
              >
                Clear cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                Proceed to checkout
              </button>
            </div>
          </Card>
        </>
      )}
    </section>
  );
}
