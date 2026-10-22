"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/ui";

/**
 * Header cart button + popover preview. Clicking the button toggles a panel
 * that lists every line in the cart with quantity controls, the running total,
 * and a Checkout button that navigates to the dedicated /checkout page.
 */
export default function CartMenu() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, count, total, updateQuantity, removeItem } = useCart();

  const [open, setOpen] = useState(false);
  // The cart count comes from localStorage, which only exists on the client.
  // Render the count-dependent UI only after mount so the server and first
  // client render match (avoids a hydration mismatch).
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the popover on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleCheckout() {
    setOpen(false);
    router.push(user ? "/checkout" : "/login");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Cart with ${mounted ? count : 0} item${
          mounted && count === 1 ? "" : "s"
        }`}
        className="relative rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
      >
        <span aria-hidden="true">🛒</span>
        {mounted && count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1 text-[11px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-stone-900">Your cart</h3>
            <span className="text-xs text-stone-500">
              {count} item{count === 1 ? "" : "s"}
            </span>
          </div>

          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-500">
              Your cart is empty.
            </p>
          ) : (
            <>
              <ul className="max-h-72 space-y-3 overflow-y-auto">
                {items.map((line) => (
                  <li
                    key={line.product.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {line.product.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {formatPrice(line.product.price)} each
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-stone-300">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateQuantity(
                                line.product.id,
                                line.quantity - 1
                              )
                            }
                            className="px-2 py-0.5 text-sm font-semibold text-stone-600 hover:text-amber-700"
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center text-xs font-semibold">
                            {line.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            disabled={
                              line.quantity >= line.product.stock_quantity
                            }
                            onClick={() =>
                              updateQuantity(
                                line.product.id,
                                line.quantity + 1
                              )
                            }
                            className="px-2 py-0.5 text-sm font-semibold text-stone-600 hover:text-amber-700 disabled:cursor-not-allowed disabled:text-stone-300"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(line.product.id)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-stone-900">
                      {formatPrice(line.product.price * line.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                <span className="text-sm font-semibold text-stone-600">
                  Total
                </span>
                <span className="text-lg font-extrabold text-stone-900">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-center text-sm font-semibold text-stone-700 transition hover:border-stone-400"
                >
                  View cart
                </Link>
                <button
                  onClick={handleCheckout}
                  className="flex-1 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Checkout
                </button>
              </div>
              {!user && (
                <p className="mt-2 text-center text-xs text-stone-400">
                  You&apos;ll need to log in to check out.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
