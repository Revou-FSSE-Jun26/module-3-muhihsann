import Card from "@/components/Card";
import { getOrders } from "@/lib/api";
import { formatPrice } from "@/lib/ui";

export const metadata = {
  title: "Orders",
  description: "Recent RevOnest orders.",
};

// Server Component: fetches GET /orders?user_id=1 (the API requires a user_id).
export default async function OrdersPage() {
  const orders = await getOrders(1);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Orders
      </h1>
      <p className="mb-6 text-sm text-stone-500">Showing orders for user #1.</p>

      {orders.length === 0 ? (
        <p className="text-stone-500">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="flex items-center justify-between p-5">
              <div>
                <p className="font-bold text-stone-900">Order #{order.id}</p>
                <p className="text-sm text-stone-500">
                  User {order.user_id}
                  {order.order_date
                    ? ` · ${new Date(order.order_date).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                  {order.status}
                </span>
                {typeof order.total_amount === "number" && (
                  <p className="mt-1 font-extrabold text-stone-900">
                    {formatPrice(order.total_amount)}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
