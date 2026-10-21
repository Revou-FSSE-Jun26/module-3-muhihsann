"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { ApiError, getOrders, deleteOrder } from "@/lib/api";
import { formatPrice, getStatusClasses } from "@/lib/ui";
import { useAuth } from "@/context/AuthContext";
import { notify } from "@/lib/toast";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setOrders(await getOrders(user.id));
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    load();
  }, [authLoading, user, load]);

  async function handleDelete(order: Order) {
    const ok = window.confirm(
      `Cancel and delete order #${order.id}? This cannot be undone.`
    );
    if (!ok) return;
    setDeletingId(order.id);
    setError(null);
    try {
      await deleteOrder(order.id);
      notify.success(`Order #${order.id} cancelled.`);
      await load();
    } catch (err) {
      const msg = messageFrom(err);
      setError(msg);
      notify.error(msg);
    } finally {
      setDeletingId(null);
    }
  }

  // Not logged in: prompt to log in (orders are per-user).
  if (!authLoading && !user) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Orders
        </h1>
        <p className="text-stone-500">
          Please{" "}
          <Link href="/login" className="font-semibold text-amber-700 hover:underline">
            log in
          </Link>{" "}
          to view your orders.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
        My Orders
      </h1>
      <p className="mb-6 text-sm text-stone-500">
        You can cancel an order only while it is still pending.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-stone-500">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-stone-500">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const canDelete = order.status === "pending";
            return (
              <Card
                key={order.id}
                className="flex items-center justify-between gap-4 p-5"
              >
                <div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-bold text-stone-900 hover:text-amber-700 hover:underline"
                  >
                    Order #{order.id}
                  </Link>
                  <p className="text-sm text-stone-500">
                    {order.order_date
                      ? new Date(order.order_date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={getStatusClasses(order.status)}>
                      {order.status}
                    </span>
                    {typeof order.total_amount === "number" && (
                      <p className="mt-1 font-extrabold text-stone-900">
                        {formatPrice(order.total_amount)}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(order)}
                    disabled={!canDelete || deletingId === order.id}
                    title={
                      canDelete
                        ? "Cancel this order"
                        : "Only pending orders can be cancelled"
                    }
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-300 disabled:hover:bg-transparent"
                  >
                    {deletingId === order.id ? "Cancelling…" : "Cancel"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

/** Turn an unknown thrown value into a user-friendly message. */
function messageFrom(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409)
      return "That order can no longer be cancelled — it is already being processed.";
    return err.message;
  }
  if (err instanceof Error && err.message) {
    return "Couldn't reach the server. Please try again in a moment.";
  }
  return "Something went wrong. Please try again.";
}
