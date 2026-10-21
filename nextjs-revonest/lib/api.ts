/* =====================================================================
   Typed data-access layer for the RevOnest web app.
   Wraps the native fetch API against the Module 2 Flask API and enforces
   a res.ok check that throws a typed error on failure.
   ===================================================================== */

import type {
  Product,
  Category,
  Order,
  User,
  LoginResponse,
  LoginPayload,
  RegisterPayload,
} from "@/lib/types";

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
    // Try to surface the API's own error message (e.g. "Invalid credentials").
    let message = `Request to ${path} failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
      else if (data?.message) message = data.message;
    } catch {
      // response had no JSON body; keep the default message
    }
    throw new ApiError(message, res.status);
  }

  // Some endpoints (e.g. DELETE) may return an empty body.
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Helper for JSON POST/PUT requests. */
function jsonBody(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

/* ---------- Auth ---------- */

// POST /auth/login — the API expects { email, password_hash }.
export function login(email: string, password: string): Promise<LoginResponse> {
  const payload: LoginPayload = { email, password_hash: password };
  return apiFetch<LoginResponse>("/auth/login", jsonBody("POST", payload));
}

// POST /users — register. The API always assigns role "customer".
export function register(
  username: string,
  email: string,
  password: string
): Promise<User> {
  const payload: RegisterPayload = { username, email, password_hash: password };
  return apiFetch<User>("/users", jsonBody("POST", payload));
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

// Fields accepted by create/update. `id`/`created_at` are server-managed.
// Note: the API stores `price` as an integer.
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: number;
}

// POST /products — returns the created product (201).
export function createProduct(input: ProductInput): Promise<Product> {
  return apiFetch<Product>("/products", jsonBody("POST", input));
}

// PUT /products/:id — returns the updated product.
export function updateProduct(
  id: number,
  input: ProductInput
): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, jsonBody("PUT", input));
}

// DELETE /products/:id — returns { message }.
export function deleteProduct(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/products/${id}`, { method: "DELETE" });
}

/* ---------- Categories ---------- */

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

// Fields accepted by create/update. `id`/`created_at` are server-managed.
export interface CategoryInput {
  name: string;
  description?: string;
}

// POST /categories — returns the created category. 409 if the name exists.
export function createCategory(input: CategoryInput): Promise<Category> {
  return apiFetch<Category>("/categories", jsonBody("POST", input));
}

// PUT /categories/:id — returns the updated category.
export function updateCategory(
  id: number,
  input: CategoryInput
): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, jsonBody("PUT", input));
}

// DELETE /categories/:id — returns { message }.
export function deleteCategory(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/categories/${id}`, { method: "DELETE" });
}

/* ---------- Orders ---------- */

// Body for POST /orders. The API takes product_id + quantity per line and
// computes prices/totals itself.
export interface CreateOrderInput {
  user_id: number;
  items: { product_id: number; quantity: number }[];
}

// POST /orders — create a pending order from cart contents. Returns the order.
export function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiFetch<Order>("/orders", jsonBody("POST", input));
}

// GET /orders?user_id=N — a single user's orders (customer view).
export function getOrders(userId: number): Promise<Order[]> {
  return apiFetch<Order[]>(`/orders?user_id=${userId}`);
}

// GET /orders (no user_id) — every order (admin view).
export function getAllOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders");
}

// GET /orders/:id — a single order with its line items.
export function getOrder(id: number): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}

// DELETE /orders/:id — returns { message }. The API rejects deletion of any
// order whose status is not "pending" with a 409.
export function deleteOrder(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/orders/${id}`, { method: "DELETE" });
}
