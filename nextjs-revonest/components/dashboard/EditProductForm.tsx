"use client";

import { useEffect, useState } from "react";
import ProductFormFields, {
  toFormValues,
  toProductInput,
  validateProduct,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/components/dashboard/ProductFormFields";
import { getProduct, updateProduct } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { notify } from "@/lib/toast";
import type { Category, Product } from "@/lib/types";

interface EditProductFormProps {
  productId: number;
  categories: Category[];
  /** Called with the product the API returned after saving. */
  onSaved: (product: Product) => void;
  onCancel: () => void;
}

/**
 * Edits a product. Pre-populates itself from GET /products/[id] (so it always
 * shows the latest saved values) and submits to PUT /products/[id].
 * Rendered inside a modal.
 */
export default function EditProductForm({
  productId,
  categories,
  onSaved,
  onCancel,
}: EditProductFormProps) {
  const [values, setValues] = useState<ProductFormValues | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load the product being edited.
  useEffect(() => {
    let active = true;
    getProduct(productId)
      .then((p) => {
        if (active) setValues(toFormValues(p));
      })
      .catch((err) => {
        if (active) setLoadError(apiErrorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [productId]);

  function handleChange(field: keyof ProductFormValues, value: string) {
    if (!values) return;
    const next = { ...values, [field]: value };
    setValues(next);
    if (Object.keys(errors).length > 0) setErrors(validateProduct(next));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values) return;
    const nextErrors = validateProduct(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setFormError(null);
    try {
      const saved = await updateProduct(productId, toProductInput(values));
      notify.success(`Product "${saved.name}" updated.`);
      onSaved(saved);
    } catch (err) {
      const msg = apiErrorMessage(err);
      setFormError(msg);
      notify.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Couldn&apos;t load this product: {loadError}
      </div>
    );
  }

  if (!values) {
    return <p className="py-6 text-center text-sm text-stone-500">Loading product…</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}

      <ProductFormFields
        values={values}
        errors={errors}
        categories={categories}
        onChange={handleChange}
      />

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
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
