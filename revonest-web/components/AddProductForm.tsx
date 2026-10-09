"use client";

import { useState } from "react";
import type { Product, ProductFormState, ProductFormErrors } from "@/lib/types";

/**
 * Validates the add-product form. Returns an errors object with a message
 * per invalid field (empty object means valid).
 */
export function validate(data: ProductFormState): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  }

  const price = Number(data.price);
  if (data.price.trim() === "") {
    errors.price = "Price is required.";
  } else if (Number.isNaN(price) || price <= 0) {
    errors.price = "Price must be a number greater than 0.";
  }

  const stock = Number(data.stock_quantity);
  if (data.stock_quantity.trim() === "") {
    errors.stock_quantity = "Stock quantity is required.";
  } else if (!Number.isInteger(stock) || stock < 0) {
    errors.stock_quantity = "Stock must be a whole number (0 or more).";
  }

  return errors;
}

interface AddProductFormProps {
  /** Called with a newly built Product when the form is valid. */
  onAdd: (product: Product) => void;
}

const EMPTY: ProductFormState = {
  name: "",
  price: "",
  stock_quantity: "",
  description: "",
};

export default function AddProductForm({ onAdd }: AddProductFormProps) {
  const [form, setForm] = useState<ProductFormState>(EMPTY);
  const [errors, setErrors] = useState<ProductFormErrors>({});

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    const next = { ...form, [name]: value };
    setForm(next);
    // Re-validate live once errors have been surfaced, so messages clear
    // as soon as a field becomes valid.
    if (Object.keys(errors).length > 0) setErrors(validate(next));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newProduct: Product = {
      id: Date.now(), // temporary client-side id
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      category_id: 0,
    };
    onAdd(newProduct);
    setForm(EMPTY);
    setErrors({});
  }

  const fieldClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
      hasError
        ? "border-rose-400 focus:ring-rose-200"
        : "border-stone-300 focus:border-amber-500 focus:ring-amber-200"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <h3 className="text-lg font-bold text-stone-900">Add a product</h3>

      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold text-stone-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          className={fieldClass(!!errors.name)}
          placeholder="e.g. Desk Lamp"
        />
        {errors.name && <p className="mt-1 text-xs font-medium text-rose-600">{errors.name}</p>}
      </div>

      {/* Price + Stock side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-semibold text-stone-700">
            Price ($)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            className={fieldClass(!!errors.price)}
            placeholder="29.99"
          />
          {errors.price && <p className="mt-1 text-xs font-medium text-rose-600">{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="stock_quantity" className="mb-1 block text-sm font-semibold text-stone-700">
            Stock
          </label>
          <input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
            min="0"
            value={form.stock_quantity}
            onChange={handleChange}
            className={fieldClass(!!errors.stock_quantity)}
            placeholder="100"
          />
          {errors.stock_quantity && (
            <p className="mt-1 text-xs font-medium text-rose-600">{errors.stock_quantity}</p>
          )}
        </div>
      </div>

      {/* Description (optional) */}
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-semibold text-stone-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          value={form.description}
          onChange={handleChange}
          className={fieldClass(false)}
          placeholder="Short description (optional)"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 active:scale-[0.99]"
      >
        Add product
      </button>
    </form>
  );
}
