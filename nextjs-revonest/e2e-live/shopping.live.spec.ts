import { test, expect } from "@playwright/test";
import { CUSTOMER, LIVE_API, apiDelete, loginAs } from "./live-helpers";

test.describe("Live: browsing and shopping", () => {
  test("visitor browses, searches, and filters the catalog", async ({ page, request }) => {
    await page.goto("/products");
    const loginToBuy = page.getByRole("link", { name: "Login to buy" });
    await expect(loginToBuy.first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart" })).toHaveCount(0);
    const total = await loginToBuy.count();

    // Live search narrows the list and is reflected in the URL.
    await page.getByPlaceholder("Search products by name...").fill("mouse");
    await expect(page).toHaveURL(/search=mouse/);
    await expect.poll(() => loginToBuy.count()).toBeLessThan(total);
    await expect(page.getByText(/mouse/i).first()).toBeVisible();

    // A category card opens the catalog filtered to that category.
    await page.goto("/categories");
    const firstCategory = page.locator('[data-testid^="category-link-"]').first();
    await firstCategory.click();
    await expect(page).toHaveURL(/category=\d+/);
    await expect(loginToBuy.first()).toBeVisible();

    // Product detail shows name, price, stock, and category. Use a product
    // that really exists, rather than assuming an id.
    const products = (await (await request.get(`${LIVE_API}/products`)).json()) as {
      id: number;
      name: string;
    }[];
    const product = products[0];
    await page.goto(`/products/${product.id}`);
    await expect(page.getByRole("heading", { name: product.name, level: 1 })).toBeVisible();
    await expect(page.getByTestId("product-category").filter({ visible: true })).toHaveCount(1);
    await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
    await expect(page.getByText(/In stock|Out of stock/).first()).toBeVisible();
  });

  test("customer adds to cart, checks out, sees the order, and cancels it", async ({
    page,
    request,
  }) => {
    let orderId: number | null = null;
    try {
      await loginAs(page, CUSTOMER.email, CUSTOMER.password);
      await expect(page).toHaveURL("/");

      // Products list -> add the first in-stock product to the cart.
      await page.goto("/products");
      const addToCart = page.getByRole("button", { name: "Add to cart" }).first();
      await expect(addToCart).toBeEnabled();
      await addToCart.click();
      await expect(page.getByText(/Added ".+" to cart/).first()).toBeVisible();

      // Cart page shows the item and a working checkout button.
      await page.goto("/cart");
      await expect(page.getByRole("button", { name: "Remove" }).first()).toBeVisible();
      await page.getByRole("button", { name: "Proceed to checkout" }).click();

      // Checkout: order summary, then confirm (POST /orders).
      await expect(page).toHaveURL("/checkout");
      await expect(page.getByText("Order summary")).toBeVisible();
      await page.getByRole("button", { name: "Place order" }).click();

      // Cart cleared and redirected to /orders, where the new order appears.
      await expect(page).toHaveURL("/orders");
      const placed = page.getByText(/Order #\d+ placed/).first();
      await expect(placed).toBeVisible();
      orderId = Number((await placed.textContent())?.match(/#(\d+)/)?.[1]);
      expect(orderId).toBeGreaterThan(0);
      await expect(page.getByRole("link", { name: `Order #${orderId}`, exact: true })).toBeVisible();

      // Order detail shows its products.
      await page.getByRole("link", { name: `Order #${orderId}`, exact: true }).click();
      await expect(page).toHaveURL(`/orders/${orderId}`);
      await expect(page.getByRole("heading", { name: `Order #${orderId}` })).toBeVisible();
      await expect(page.getByText("Items")).toBeVisible();

      // Clean up through the UI: cancel the pending order.
      await page.goto("/orders");
      const card = page
        .locator("div")
        .filter({ has: page.getByRole("link", { name: `Order #${orderId}`, exact: true }) })
        .filter({ has: page.getByRole("button", { name: "Cancel" }) })
        .last();
      page.once("dialog", (d) => d.accept());
      await card.getByRole("button", { name: "Cancel" }).click();
      await expect(page.getByRole("link", { name: `Order #${orderId}`, exact: true })).toHaveCount(0);
      orderId = null; // already removed
    } finally {
      // Safety net if the test failed before cancelling.
      if (orderId) await apiDelete(request, `/orders/${orderId}`);
    }
  });

  test("checkout is unavailable when the cart is empty", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, CUSTOMER.password);
    await expect(page).toHaveURL("/");
    await page.goto("/checkout");
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Place order" })).toHaveCount(0);
  });

  test("the live site reads from the configured API", async ({ request }) => {
    // Sanity check that the backend the tests clean up against is reachable.
    const res = await request.get(`${LIVE_API}/products`);
    expect(res.ok()).toBeTruthy();
  });
});
