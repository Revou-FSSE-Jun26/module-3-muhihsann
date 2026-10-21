"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import {
  ApiError,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api";
import { notify } from "@/lib/toast";
import type { Category } from "@/lib/types";

export default function CategoriesAdminPage() {
  return (
    <RouteGuard requireRole="admin">
      <CategoriesAdmin />
    </RouteGuard>
  );
}

function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create-form state.
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Which row is being edited, plus its working values.
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Which row is being deleted (disables its button while in flight).
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCategories(await getCategories());
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Category name is required.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createCategory({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
      });
      setNewName("");
      setNewDescription("");
      notify.success("Category created.");
      await load();
    } catch (err) {
      const msg = messageFrom(err);
      setError(msg);
      notify.error(msg);
    } finally {
      setCreating(false);
    }
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description ?? "");
    setError(null);
  }

  function cancelEdit() {
    setEditId(null);
    setEditName("");
    setEditDescription("");
  }

  async function handleSaveEdit(id: number) {
    if (!editName.trim()) {
      setError("Category name is required.");
      return;
    }
    setSavingEdit(true);
    setError(null);
    try {
      await updateCategory(id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      cancelEdit();
      notify.success("Category updated.");
      await load();
    } catch (err) {
      const msg = messageFrom(err);
      setError(msg);
      notify.error(msg);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(cat: Category) {
    const ok = window.confirm(
      `Delete category "${cat.name}"? This cannot be undone.`
    );
    if (!ok) return;
    setDeletingId(cat.id);
    setError(null);
    try {
      await deleteCategory(cat.id);
      notify.success("Category deleted.");
      await load();
    } catch (err) {
      const msg = messageFrom(err);
      setError(msg);
      notify.error(msg);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-amber-700 hover:underline"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Categories
        </h1>
        <p className="mt-1 text-stone-500">
          Create, edit, and remove product categories.
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

      {/* Create form */}
      <Card className="mb-6 p-5">
        <h2 className="mb-3 font-bold text-stone-900">Add a category</h2>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
        >
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-stone-600">
              Name
            </span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Toys"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-stone-600">
              Description
            </span>
            <input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Adding…" : "Add"}
          </button>
        </form>
      </Card>

      {/* List */}
      <Card className="overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-center text-stone-500">
            Loading categories…
          </p>
        ) : categories.length === 0 ? (
          <p className="px-5 py-8 text-center text-stone-500">
            No categories yet. Add one above.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {categories.map((cat) => (
              <li key={cat.id} className="px-5 py-4">
                {editId === cat.id ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-center">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        disabled={savingEdit}
                        className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
                      >
                        {savingEdit ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={savingEdit}
                        className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900">{cat.name}</p>
                      <p className="truncate text-sm text-stone-500">
                        {cat.description || "No description"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deletingId === cat.id}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-60"
                      >
                        {deletingId === cat.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

/** Turn an unknown thrown value into a user-friendly message. */
function messageFrom(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return "A category with that name already exists.";
    return err.message;
  }
  if (err instanceof Error && err.message) {
    return "Couldn't reach the server. Please try again in a moment.";
  }
  return "Something went wrong. Please try again.";
}
