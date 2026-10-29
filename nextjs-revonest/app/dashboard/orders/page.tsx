"use client";

import { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getAllOrders, getOrder } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { formatPrice, getStatusClasses } from "@/lib/ui";
import type { Order } from "@/lib/types";

// Admin-only. Logged-out visitors go to /login, customers to /.
export default function OrdersAdminPage() {
  return (
    <RouteGuard requireRole="admin">
      <OrdersOverview />
    </RouteGuard>
  );
}

/**
 * Read-only overview of every order from every user, with each order's
 * product list (from order_items) and total.
 *
 * GET /orders doesn't include line items, so after loading the list we fetch
 * each order's details (GET /orders/[id]) in parallel. If one detail request
 * fails, that row still shows, just without its product list.
 */
function OrdersOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await getAllOrders();
        const details = await Promise.allSettled(list.map((o) => getOrder(o.id)));
        const withItems = list.map((o, i) => {
          const d = details[i];
          return d.status === "fulfilled" ? { ...o, items: d.value.items } : o;
        });
        if (active) setOrders(withItems.sort((a, b) => a.id - b.id));
      } catch (err) {
        if (active) setError(apiErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardShell
      title="Orders"
      description="Every order from every customer. This view is read-only."
    >
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
          <p className="px-5 py-8 text-center text-stone-500">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="px-5 py-8 text-center text-stone-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">All orders</caption>
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                  <th scope="col" className="px-4 py-3 font-semibold">User ID</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Products</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id} data-testid={`order-row-${order.id}`} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-stone-900">#{order.id}</p>
                      <p className="text-xs text-stone-500">
                        {order.order_date
                          ? new Date(order.order_date).toLocaleDateString()
                          : "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{order.user_id}</td>
                    <td className="px-4 py-3">
                      {order.items && order.items.length > 0 ? (
                        <ul className="space-y-0.5">
                          {order.items.map((item, i) => (
                            <li key={`${item.product_id}-${i}`} className="text-stone-700">
                              {item.product_name ?? `Product #${item.product_id}`}
                              <span className="text-stone-400"> × {item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-stone-400">Couldn&apos;t load items</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusClasses(order.status)}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-stone-900">
                      {typeof order.total_amount === "number"
                        ? formatPrice(order.total_amount)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
