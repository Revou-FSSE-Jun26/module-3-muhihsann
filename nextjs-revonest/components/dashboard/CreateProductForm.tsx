"use client";

import { useState } from "react";
import ProductFormFields, {
  EMPTY_PRODUCT_FORM,
  toProductInput,
  validateProduct,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/components/dashboard/ProductFormFields";
import { createProduct } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { notify } from "@/lib/toast";
import type { Category, Product } from "@/lib/types";

interface CreateProductFormProps {
  categories: Category[];
  /** Called with the product the API created. */
  onCreated: (product: Product) => void;
  onCancel: () => void;
}

/** Creates a product via POST /products. Rendered inside a modal. */
export default function CreateProductForm({
  categories,
  onCreated,
  onCancel,
}: CreateProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleChange(field: keyof ProductFormValues, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Once errors are showing, re-validate live so they clear as you fix them.
    if (Object.keys(errors).length > 0) setErrors(validateProduct(next));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateProduct(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setFormError(null);
    try {
      const created = await createProduct(toProductInput(values));
      notify.success(`Product "${created.name}" created.`);
      onCreated(created);
    } catch (err) {
      const msg = apiErrorMessage(err);
      setFormError(msg);
      notify.error(msg);
    } finally {
      setSaving(false);
    }
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
          {saving ? "Creating…" : "Create product"}
        </button>
      </div>
    </form>
  );
}
