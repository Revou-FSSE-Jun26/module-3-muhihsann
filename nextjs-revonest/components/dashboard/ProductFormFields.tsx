"use client";

import type { Category, Product } from "@/lib/types";
import type { ProductInput } from "@/lib/api";

/** Form values are strings because they come straight from inputs. */
export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  category_id: string;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  stock_quantity: "",
  category_id: "",
};

/** Turn an existing product into form values (used by EditProductForm). */
export function toFormValues(p: Product): ProductFormValues {
  return {
    name: p.name,
    description: p.description ?? "",
    price: String(p.price),
    stock_quantity: String(p.stock_quantity),
    category_id: String(p.category_id),
  };
}

/** Per-field validation. An empty object means the form is valid. */
export function validateProduct(v: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!v.name.trim()) errors.name = "Name is required.";
  else if (v.name.trim().length > 150)
    errors.name = "Name must be 150 characters or fewer.";

  if (!v.category_id) errors.category_id = "Choose a category.";

  const price = Number(v.price);
  if (v.price.trim() === "") errors.price = "Price is required.";
  else if (!Number.isInteger(price) || price < 0)
    errors.price = "Price must be a whole number, 0 or more.";

  const stock = Number(v.stock_quantity);
  if (v.stock_quantity.trim() === "")
    errors.stock_quantity = "Stock is required.";
  else if (!Number.isInteger(stock) || stock < 0)
    errors.stock_quantity = "Stock must be a whole number, 0 or more.";

  return errors;
}

/** Convert valid form values into the API payload. */
export function toProductInput(v: ProductFormValues): ProductInput {
  return {
    name: v.name.trim(),
    description: v.description.trim(),
    price: Number(v.price),
    stock_quantity: Number(v.stock_quantity),
    category_id: Number(v.category_id),
  };
}

interface ProductFormFieldsProps {
  values: ProductFormValues;
  errors: ProductFormErrors;
  categories: Category[];
  onChange: (field: keyof ProductFormValues, value: string) => void;
}

/** The input fields shared by CreateProductForm and EditProductForm. */
export default function ProductFormFields({
  values,
  errors,
  categories,
  onChange,
}: ProductFormFieldsProps) {
  const field = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
      hasError
        ? "border-rose-400 focus:ring-rose-200"
        : "border-stone-300 focus:border-amber-400 focus:ring-amber-200"
    }`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="product-name" className="mb-1 block text-xs font-semibold text-stone-600">
          Name
        </label>
        <input
          id="product-name"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "product-name-error" : undefined}
          placeholder="e.g. Wireless Keyboard"
          className={field(!!errors.name)}
        />
        {errors.name && (
          <p id="product-name-error" className="mt-1 text-xs font-medium text-rose-600">
            {errors.name}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="product-category" className="mb-1 block text-xs font-semibold text-stone-600">
          Category
        </label>
        <select
          id="product-category"
          value={values.category_id}
          onChange={(e) => onChange("category_id", e.target.value)}
          aria-invalid={!!errors.category_id}
          aria-describedby={errors.category_id ? "product-category-error" : undefined}
          className={`${field(!!errors.category_id)} bg-white`}
        >
          <option value="">Select a category…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p id="product-category-error" className="mt-1 text-xs font-medium text-rose-600">
            {errors.category_id}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="product-price" className="mb-1 block text-xs font-semibold text-stone-600">
          Price ($, whole number)
        </label>
        <input
          id="product-price"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={values.price}
          onChange={(e) => onChange("price", e.target.value)}
          aria-invalid={!!errors.price}
          aria-describedby={errors.price ? "product-price-error" : undefined}
          placeholder="e.g. 25"
          className={field(!!errors.price)}
        />
        {errors.price && (
          <p id="product-price-error" className="mt-1 text-xs font-medium text-rose-600">
            {errors.price}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="product-stock" className="mb-1 block text-xs font-semibold text-stone-600">
          Stock quantity
        </label>
        <input
          id="product-stock"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={values.stock_quantity}
          onChange={(e) => onChange("stock_quantity", e.target.value)}
          aria-invalid={!!errors.stock_quantity}
          aria-describedby={errors.stock_quantity ? "product-stock-error" : undefined}
          placeholder="e.g. 100"
          className={field(!!errors.stock_quantity)}
        />
        {errors.stock_quantity && (
          <p id="product-stock-error" className="mt-1 text-xs font-medium text-rose-600">
            {errors.stock_quantity}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="product-description" className="mb-1 block text-xs font-semibold text-stone-600">
          Description <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <textarea
          id="product-description"
          rows={3}
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Short description"
          className={field(false)}
        />
      </div>
    </div>
  );
}
