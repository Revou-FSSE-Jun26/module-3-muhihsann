"use client";

import { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import DashboardShell from "@/components/dashboard/DashboardShell";
import CreateCategoryForm from "@/components/dashboard/CreateCategoryForm";
import EditCategoryForm from "@/components/dashboard/EditCategoryForm";
import InlineConfirmDelete from "@/components/dashboard/InlineConfirmDelete";
import { deleteCategory, getCategories } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { notify } from "@/lib/toast";
import type { Category } from "@/lib/types";

// Admin-only. Logged-out visitors go to /login, customers to /.
export default function CategoriesAdminPage() {
  return (
    <RouteGuard requireRole="admin">
      <CategoryManagement />
    </RouteGuard>
  );
}

/**
 * Category management: a table of every category with Edit and Delete.
 * - "Add category" opens CreateCategoryForm (name only) in a modal.
 * - "Edit" opens EditCategoryForm in a modal, pre-filled with the name.
 * - "Delete" confirms inline; if the backend refuses (the category still has
 *   products) its message is shown.
 */
function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((cats) => {
        if (active) setCategories(cats);
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

  function handleCreated(category: Category) {
    setCategories((prev) => [...prev, category]);
    setCreating(false);
    setError(null);
  }

  function handleSaved(category: Category) {
    setCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)));
    setEditing(null);
    setError(null);
  }

  async function handleDelete(category: Category) {
    setError(null);
    try {
      await deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      notify.success(`Category "${category.name}" deleted.`);
    } catch (err) {
      // e.g. 400 "Cannot delete category that has products" — show it as-is.
      const msg = apiErrorMessage(err);
      setError(`Couldn't delete "${category.name}": ${msg}`);
      notify.error(msg);
    }
  }

  return (
    <DashboardShell
      title="Categories"
      description="Create, rename, and remove product categories."
      action={
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          + Add category
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
          <p className="px-5 py-8 text-center text-stone-500">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="px-5 py-8 text-center text-stone-500">
            No categories yet. Use &ldquo;Add category&rdquo; to create one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">All categories</caption>
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Description</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {categories.map((c) => (
                  <tr key={c.id} data-testid={`category-row-${c.id}`} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-semibold text-stone-900">{c.name}</td>
                    <td className="px-4 py-3 text-stone-500">{c.description || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(c)}
                          data-testid={`category-edit-${c.id}`}
                          aria-label={`Edit ${c.name}`}
                          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
                        >
                          Edit
                        </button>
                        <InlineConfirmDelete
                          itemName={c.name}
                          testId={`category-delete-${c.id}`}
                          onConfirm={() => handleDelete(c)}
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

      <Modal open={creating} title="Add a category" onClose={() => setCreating(false)}>
        <CreateCategoryForm onCreated={handleCreated} onCancel={() => setCreating(false)} />
      </Modal>

      <Modal open={editing !== null} title="Edit category" onClose={() => setEditing(null)}>
        {editing && (
          <EditCategoryForm
            category={editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </DashboardShell>
  );
}
