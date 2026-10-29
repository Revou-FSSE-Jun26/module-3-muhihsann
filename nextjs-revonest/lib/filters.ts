/* =====================================================================
   Client-side product filtering.

   The Flask API's GET /products ignores the ?search= and ?category_id=
   query params and always returns every product, so the catalog applies
   the filters here after fetching. Matching is case-insensitive on name.
   ===================================================================== */

import type { Product } from "@/lib/types";

export interface ProductFilters {
  /** Free-text search, matched against the product name. */
  search?: string;
  /** Category id, or undefined for all categories. */
  categoryId?: number;
}

export function filterProducts(
  products: Product[],
  { search, categoryId }: ProductFilters
): Product[] {
  const term = search?.trim().toLowerCase() ?? "";
  return products.filter((p) => {
    if (categoryId !== undefined && p.category_id !== categoryId) return false;
    if (term && !p.name.toLowerCase().includes(term)) return false;
    return true;
  });
}

/** Parse the ?category= URL param into a category id (or undefined). */
export function parseCategoryParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}
