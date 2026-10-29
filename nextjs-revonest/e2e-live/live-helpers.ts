import type { APIRequestContext, Page } from "@playwright/test";

/** The real Flask API the deployed site talks to. */
export const LIVE_API =
  process.env.LIVE_API_URL ?? "https://revoshop-sgjp.onrender.com";

/** Demo accounts that exist in the live database. */
export const ADMIN = { email: "admin@revonest.com", password: "Admin123" };
export const CUSTOMER = {
  email: "okejohn@email.com",
  password: "Password123",
  username: "okejohn",
};

/** A short unique suffix so test data never collides with real data. */
export function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

/** Log in through the UI. */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

/**
 * Best-effort cleanup through the API. Used in `finally` blocks so test data
 * is removed even when a test fails partway through. A 404 means the UI
 * already deleted it, which is fine.
 */
export async function apiDelete(request: APIRequestContext, path: string) {
  try {
    await request.delete(`${LIVE_API}${path}`, { timeout: 60_000 });
  } catch {
    // ignore: cleanup must never fail the test
  }
}

interface ApiProduct {
  id: number;
  name: string;
  category_id: number;
}
interface ApiOrder {
  id: number;
  status: string;
}
interface ApiOrderDetail {
  items?: { product_id: number }[];
}

/**
 * Find a product that the backend will refuse to delete because it's part of
 * an active (pending / processing / shipped) order. Read-only.
 */
export async function findProductInActiveOrder(
  request: APIRequestContext
): Promise<ApiProduct | null> {
  const products = (await (await request.get(`${LIVE_API}/products`)).json()) as ApiProduct[];
  const orders = (await (await request.get(`${LIVE_API}/orders`)).json()) as ApiOrder[];
  const active = orders.filter((o) => ["pending", "processing", "shipped"].includes(o.status));

  for (const order of active) {
    const detail = (await (await request.get(`${LIVE_API}/orders/${order.id}`)).json()) as ApiOrderDetail;
    for (const item of detail.items ?? []) {
      const product = products.find((p) => p.id === item.product_id);
      if (product) return product;
    }
  }
  return null;
}

/** Find a category that still has products (the backend won't delete it). */
export async function findCategoryWithProducts(
  request: APIRequestContext
): Promise<{ id: number; name: string } | null> {
  const products = (await (await request.get(`${LIVE_API}/products`)).json()) as ApiProduct[];
  const categories = (await (await request.get(`${LIVE_API}/categories`)).json()) as {
    id: number;
    name: string;
  }[];
  return categories.find((c) => products.some((p) => p.category_id === c.id)) ?? null;
}
