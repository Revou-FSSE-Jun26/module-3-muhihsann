/* =====================================================================
   Typed data-access layer for the RevOnest web app.
   Wraps the native fetch API against the Module 2 Flask API and enforces
   a res.ok check that throws a typed error on failure.
   ===================================================================== */

import type { Product, Category, Order } from "@/lib/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

/** Error type thrown when an API response is not ok. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Core fetch helper. Throws a typed ApiError when res.ok is false so that
 * route-level error.tsx boundaries can catch and render a friendly UI.
 */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    // Always get fresh data from the API for this checkpoint.
    cache: "no-store",
    ...init,
  });

  if (!res.ok) {
    throw new ApiError(
      `Request to ${path} failed with status ${res.status}`,
      res.status
    );
  }

  return (await res.json()) as T;
}

/* ---------- Products ---------- */

export function getProducts(params?: {
  search?: string;
  category_id?: number;
}): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.category_id) qs.set("category_id", String(params.category_id));
  const query = qs.toString();
  return apiFetch<Product[]>(`/products${query ? `?${query}` : ""}`);
}

export function getProduct(id: string | number): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

/* ---------- Categories ---------- */

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

/* ---------- Orders ---------- */

// The API requires a user_id query param, so default to user 1 for the demo.
export function getOrders(userId: number = 1): Promise<Order[]> {
  return apiFetch<Order[]>(`/orders?user_id=${userId}`);
}
