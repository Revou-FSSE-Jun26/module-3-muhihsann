"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/Card";
import RouteGuard from "@/components/RouteGuard";
import { ApiError, getOrder } from "@/lib/api";
import { formatPrice, getStatusClasses } from "@/lib/ui";
import { useAuth } from "@/hooks/useAuth";
import type { Order } from "@/lib/types";

// Customers only: logged-out visitors go to /login, admins to /dashboard.
export default function OrderDetailPage() {
  return (
    <RouteGuard requireRole="customer" redirectTo="/dashboard">
      <OrderDetailContent />
    </RouteGuard>
  );
}

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrder(orderId);
      // Customers may only view their own orders. Treat anyone else's order
      // as not found rather than revealing that it exists.
      if (user && data.user_id !== user.id) {
        setOrder(null);
        setError("Order not found.");
      } else {
        setOrder(data);
      }
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Couldn't load this order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [orderId, user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/orders"
        className="text-sm text-stone-500 hover:text-amber-700"
      >
        ← Back to orders
      </Link>

      {loading ? (
        <p className="mt-6 text-stone-500">Loading order…</p>
      ) : error ? (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : order ? (
        <Card className="mt-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Order #{order.id}
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                {order.order_date
                  ? new Date(order.order_date).toLocaleString()
                  : "—"}
              </p>
            </div>
            <span className={getStatusClasses(order.status)}>
              {order.status}
            </span>
          </div>

          <h2 className="mt-6 mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Items
          </h2>
          {order.items && order.items.length > 0 ? (
            <ul className="divide-y divide-stone-100">
              {order.items.map((item, i) => (
                <li
                  key={`${item.product_id}-${i}`}
                  className="flex items-center justify-between py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-900">
                      {item.product_name ?? `Product #${item.product_id}`}
                    </p>
                    <p className="text-sm text-stone-500">
                      {formatPrice(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-stone-900">
                    {formatPrice(item.unit_price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-500">
              No line items available for this order.
            </p>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
            <span className="font-semibold text-stone-600">Total</span>
            <span className="text-2xl font-extrabold text-stone-900">
              {typeof order.total_amount === "number"
                ? formatPrice(order.total_amount)
                : "—"}
            </span>
          </div>
        </Card>
      ) : null}
    </section>
  );
}
