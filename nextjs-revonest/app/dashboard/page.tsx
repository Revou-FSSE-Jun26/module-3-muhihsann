"use client";

import { useEffect, useMemo, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import DashboardShell from "@/components/dashboard/DashboardShell";
import CreateProductForm from "@/components/dashboard/CreateProductForm";
import EditProductForm from "@/components/dashboard/EditProductForm";
import InlineConfirmDelete from "@/components/dashboard/InlineConfirmDelete";
import { deleteProduct, getCategories, getProducts } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { notify } from "@/lib/toast";
import { formatPrice } from "@/lib/ui";
import type { Category, Product } from "@/lib/types";

// Admin-only. Logged-out visitors go to /login, customers to /.
export default function DashboardPage() {
  return (
    <RouteGuard requireRole="admin">
      <ProductManagement />
    </RouteGuard>
  );
}

/**
 * Product management: a table of every product with Edit and Delete per row.
 * - "Add product" opens CreateProductForm in a modal (POST /products).
 * - "Edit" opens EditProductForm in a modal (GET + PUT /products/[id]).
 * - "Delete" asks for confirmation inline (DELETE /products/[id]); if the
 *   backend refuses (e.g. the product has active orders) its message is shown.
 */
function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        if (!active) return;
        setProducts(prods);
        setCategories(cats);
      })
      .catch((err) => {
        if (active) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categoryName = useMemo(() => {
    const names = new Map(categories.map((c) => [c.id, c.name]));
    return (id: number) => names.get(id) ?? `#${id}`;
  }, [categories]);

  function handleCreated(product: Product) {
    setProducts((prev) => [...prev, product]);
    setCreating(false);
    setError(null);
  }

  function handleSaved(product: Product) {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    setEditingId(null);
    setError(null);
  }

  async function handleDelete(product: Product) {
    setError(null);
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      notify.success(`Product "${product.name}" deleted.`);
    } catch (err) {
      // e.g. 400 "Cannot delete product with active orders" — show it as-is.
      const msg = apiErrorMessage(err);
      setError(`Couldn't delete "${product.name}": ${msg}`);
      notify.error(msg);
    }
  }

  return (
    <DashboardShell
      title="Products"
      description="Create, edit, and remove products."
      action={
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          + Add product
        </button>
      }
    >
      {error && (
        <div
          role="alert"
          data-testid="dashboard-error"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-center text-stone-500">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="px-5 py-8 text-center text-stone-500">
            No products yet. Use &ldquo;Add product&rdquo; to create one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">All products</caption>
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Price</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} data-testid={`product-row-${p.id}`} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-stone-900">{p.name}</p>
                      <p className="max-w-xs truncate text-xs text-stone-500">
                        {p.description || "No description"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{categoryName(p.category_id)}</td>
                    <td className="px-4 py-3 text-right text-stone-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-right text-stone-600">{p.stock_quantity}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(p.id)}
                          data-testid={`product-edit-${p.id}`}
                          aria-label={`Edit ${p.name}`}
                          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
                        >
                          Edit
                        </button>
                        <InlineConfirmDelete
                          itemName={p.name}
                          testId={`product-delete-${p.id}`}
                          onConfirm={() => handleDelete(p)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={creating} title="Add a product" onClose={() => setCreating(false)}>
        <CreateProductForm
          categories={categories}
          onCreated={handleCreated}
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <Modal open={editingId !== null} title="Edit product" onClose={() => setEditingId(null)}>
        {editingId !== null && (
          <EditProductForm
            productId={editingId}
            categories={categories}
            onSaved={handleSaved}
            onCancel={() => setEditingId(null)}
          />
        )}
      </Modal>
    </DashboardShell>
  );
}
