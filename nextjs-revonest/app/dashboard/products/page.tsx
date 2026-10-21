"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import {
  ApiError,
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api";
import type { Product, Category } from "@/lib/types";

export default function ProductsAdminPage() {
  return (
    <RouteGuard requireRole="admin">
      <ProductsAdmin />
    </RouteGuard>
  );
}

/** Working values for the add/edit form (strings because they come from inputs). */
interface FormState {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  category_id: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  stock_quantity: "",
  category_id: "",
};

function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state. editId === null means "add" mode; a number means "edit".
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Quick lookup from category id -> name for the table.
  const categoryName = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return (id: number) => map.get(id) ?? `#${id}`;
  }, [categories]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditId(null);
  }

  function startEdit(p: Product) {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      stock_quantity: String(p.stock_quantity),
      category_id: String(p.category_id),
    });
    setError(null);
    // Bring the form into view on smaller screens.
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.category_id) return "Please choose a category.";
    const price = Number(form.price);
    if (form.price === "" || Number.isNaN(price) || price < 0)
      return "Price must be a non-negative number.";
    const stock = Number(form.stock_quantity);
    if (
      form.stock_quantity === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    )
      return "Stock must be a non-negative whole number.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      // API stores price as an integer, so round before sending.
      price: Math.round(Number(form.price)),
      stock_quantity: Number(form.stock_quantity),
      category_id: Number(form.category_id),
    };
    try {
      if (editId === null) {
        await createProduct(payload);
      } else {
        await updateProduct(editId, payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    const ok = window.confirm(
      `Delete product "${p.name}"? This cannot be undone.`
    );
    if (!ok) return;
    setDeletingId(p.id);
    setError(null);
    try {
      await deleteProduct(p.id);
      // If we were editing the product we just deleted, clear the form.
      if (editId === p.id) resetForm();
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
          Products
        </h1>
        <p className="mt-1 text-stone-500">
          Create, edit, and remove products.
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

      {/* Add / edit form */}
      <Card className="mb-6 p-5">
        <h2 className="mb-3 font-bold text-stone-900">
          {editId === null ? "Add a product" : `Editing product #${editId}`}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-stone-600">
              Name
            </span>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Wireless Keyboard"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-stone-600">
              Category
            </span>
            <select
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-stone-600">
              Price (whole number)
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="e.g. 25"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-stone-600">
              Stock quantity
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={form.stock_quantity}
              onChange={(e) => update("stock_quantity", e.target.value)}
              placeholder="e.g. 100"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-stone-600">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              placeholder="Short description"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>

          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving…"
                : editId === null
                  ? "Add product"
                  : "Save changes"}
            </button>
            {editId !== null && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </Card>

      {/* Product list */}
      <Card className="overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-center text-stone-500">
            Loading products…
          </p>
        ) : products.length === 0 ? (
          <p className="px-5 py-8 text-center text-stone-500">
            No products yet. Add one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-stone-900">{p.name}</p>
                      <p className="max-w-xs truncate text-xs text-stone-500">
                        {p.description || "No description"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {categoryName(p.category_id)}
                    </td>
                    <td className="px-4 py-3 text-right text-stone-900">
                      ${p.price}
                    </td>
                    <td className="px-4 py-3 text-right text-stone-600">
                      {p.stock_quantity}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-60"
                        >
                          {deletingId === p.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
    if (err.status === 409) return "A product with that name already exists.";
    return err.message;
  }
  if (err instanceof Error && err.message) {
    return "Couldn't reach the server. Please try again in a moment.";
  }
  return "Something went wrong. Please try again.";
}
