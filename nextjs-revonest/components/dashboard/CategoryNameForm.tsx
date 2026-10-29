"use client";

import { useState } from "react";
import { apiErrorMessage } from "@/lib/errors";

/** Validate a category name. Returns an error message, or null if valid. */
export function validateCategoryName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Category name is required.";
  if (trimmed.length < 2) return "Category name must be at least 2 characters.";
  if (trimmed.length > 100) return "Category name must be 100 characters or fewer.";
  return null;
}

interface CategoryNameFormProps {
  initialName?: string;
  submitLabel: string;
  savingLabel: string;
  /** Saves the trimmed name. Throw to show the error in the form. */
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
}

/**
 * The single-field form behind CreateCategoryForm and EditCategoryForm.
 * Validates the name before calling the API, and shows API errors
 * (e.g. a duplicate name) inline.
 */
export default function CategoryNameForm({
  initialName = "",
  submitLabel,
  savingLabel,
  onSubmit,
  onCancel,
}: CategoryNameFormProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateCategoryName(name);
    setError(problem);
    if (problem) return;

    setSaving(true);
    try {
      await onSubmit(name.trim());
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="category-name" className="mb-1 block text-xs font-semibold text-stone-600">
          Name
        </label>
        <input
          id="category-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(validateCategoryName(e.target.value));
          }}
          aria-invalid={!!error}
          aria-describedby={error ? "category-name-error" : undefined}
          placeholder="e.g. Toys"
          autoFocus
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            error
              ? "border-rose-400 focus:ring-rose-200"
              : "border-stone-300 focus:border-amber-400 focus:ring-amber-200"
          }`}
        />
        {error && (
          <p id="category-name-error" role="alert" className="mt-1 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
        >
          {saving ? savingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
