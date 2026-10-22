import { test, expect } from "@playwright/test";
import { CUSTOMER, loginAs } from "./helpers";

test.describe("Shopping journey", () => {
  test("browse products, add to cart, and check out", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, CUSTOMER.password);

    // Browse the catalog.
    await page.goto("/products");
    const card = page.getByText("Wireless Mouse").first();
    await expect(card).toBeVisible();

    // Add the first product to the cart.
    await page
      .getByRole("button", { name: "Add to cart" })
      .first()
      .click();

    // Open the cart from the header; the badge should reflect one item.
    await page.getByRole("button", { name: /Cart with/ }).click();
    await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();

    // Go to the dedicated checkout page and place the order.
    await page.getByRole("button", { name: "Checkout" }).click();
    await expect(page).toHaveURL("/checkout");
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

    await page.getByRole("button", { name: "Place order" }).click();

    // Order placed -> redirected to the orders list with the new order.
    await expect(page).toHaveURL("/orders");
    await expect(page.getByRole("heading", { name: "My Orders" })).toBeVisible();
    await expect(page.getByText(/Order #/).first()).toBeVisible();
  });

  test("checkout button is disabled when the cart is empty", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, CUSTOMER.password);

    await page.goto("/checkout");
    // Empty cart shows the empty state, no place-order action.
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Place order" })).toHaveCount(0);
  });
});
