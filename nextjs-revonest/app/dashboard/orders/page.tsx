"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import { ApiError, getAllOrders, deleteOrder } from "@/lib/api";
import { formatPrice, getStatusClasses } from "@/lib/ui";
import type { Order } from "@/lib/types";

export default function OrdersAdminPage() {
  return (
    <RouteGuard requireRole="admin">
      <OrdersAdmin />
    </RouteGuard>
  );
}

function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setOrders(await getAllOrders());
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(order: Order) {
    const ok = window.confirm(
      `Delete order #${order.id}? This cannot be undone.`
    );
    if (!ok) return;
    setDeletingId(order.id);
    setError(null);
    try {
      await deleteOrder(order.id);
      await load();
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-amber-700 hover:underline"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-stone-500">
          All customer orders. Only pending orders can be deleted.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-center text-stone-500">
            Loading orders…
          </p>
        ) : orders.length === 0 ? (
          <p className="px-5 py-8 text-center text-stone-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => {
                  const canDelete = order.status === "pending";
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/60">
                      <td className="px-4 py-3 font-semibold text-stone-900">
                        #{order.id}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {order.user_id}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {order.order_date
                          ? new Date(order.order_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={getStatusClasses(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-stone-900">
                        {typeof order.total_amount === "number"
                          ? formatPrice(order.total_amount)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDelete(order)}
                            disabled={!canDelete || deletingId === order.id}
                            title={
                              canDelete
                                ? "Delete this pending order"
                                : "Only pending orders can be deleted"
                            }
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-300 disabled:hover:bg-transparent"
                          >
                            {deletingId === order.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}

/** Turn an unknown thrown value into a user-friendly message. */
function messageFrom(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409)
      return "That order can't be deleted — it is already being processed.";
    return err.message;
  }
  if (err instanceof Error && err.message) {
    return "Couldn't reach the server. Please try again in a moment.";
  }
  return "Something went wrong. Please try again.";
}
