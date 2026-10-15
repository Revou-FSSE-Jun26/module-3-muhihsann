"use client";

import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  return (
    <RouteGuard requireRole="admin">
      <DashboardContent />
    </RouteGuard>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <p className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
          Admin
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-stone-500">
          Welcome, {user?.username}. Manage the RevOnest store from here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <h2 className="font-bold text-stone-900">Products</h2>
          <p className="mt-1 text-sm text-stone-500">
            Create, edit, and remove products.
          </p>
          <span className="mt-3 inline-block text-xs text-stone-400">
            Coming next
          </span>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold text-stone-900">Categories</h2>
          <p className="mt-1 text-sm text-stone-500">
            Manage product categories.
          </p>
          <Link
            href="/dashboard/categories"
            className="mt-3 inline-block text-xs font-semibold text-amber-700 hover:underline"
          >
            Open →
          </Link>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold text-stone-900">Orders</h2>
          <p className="mt-1 text-sm text-stone-500">
            Read-only overview of all orders.
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-3 inline-block text-xs font-semibold text-amber-700 hover:underline"
          >
            Open →
          </Link>
        </Card>
      </div>
    </section>
  );
}
