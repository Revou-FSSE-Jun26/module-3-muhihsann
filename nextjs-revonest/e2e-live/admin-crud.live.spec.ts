import { test, expect, type Page } from "@playwright/test";
import {
  ADMIN,
  apiDelete,
  findCategoryWithProducts,
  findProductInActiveOrder,
  loginAs,
  uniqueSuffix,
} from "./live-helpers";

/** Log in as admin and wait for the product table to finish loading. */
async function openDashboard(page: Page) {
  await loginAs(page, ADMIN.email, ADMIN.password);
  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator('[data-testid^="product-row-"]').first()).toBeVisible();
}

test.describe("Live: admin dashboard", () => {
  test("creates, edits, and deletes a product", async ({ page, request }) => {
    const name = `E2E Test Product ${uniqueSuffix()}`;
    let productId: number | null = null;
    try {
      await openDashboard(page);

      // Create in the modal (POST /products).
      await page.getByRole("button", { name: "+ Add product" }).click();
      const create = page.getByRole("dialog", { name: "Add a product" });
      await create.getByLabel("Name").fill(name);
      await create.getByLabel("Category").selectOption({ index: 1 });
      await create.getByLabel(/Price/).fill("10");
      await create.getByLabel("Stock quantity").fill("5");
      await create.getByLabel(/Description/).fill("Created by the live E2E suite");
      await create.getByRole("button", { name: "Create product" }).click();
      await expect(create).toBeHidden();

      const row = page.getByRole("row", { name: new RegExp(name) });
      await expect(row).toBeVisible();
      productId = Number((await row.getAttribute("data-testid"))?.replace("product-row-", ""));
      expect(productId).toBeGreaterThan(0);

      // Edit in the modal, pre-filled from GET /products/[id] (PUT).
      await page.getByTestId(`product-edit-${productId}`).click();
      const edit = page.getByRole("dialog", { name: "Edit product" });
      await expect(edit.getByLabel("Name")).toHaveValue(name);
      await edit.getByLabel("Name").fill(`${name} (edited)`);
      await edit.getByLabel(/Price/).fill("12");
      await edit.getByRole("button", { name: "Save changes" }).click();
      await expect(edit).toBeHidden();
      await expect(page.getByTestId(`product-row-${productId}`)).toContainText(`${name} (edited)`);
      await expect(page.getByTestId(`product-row-${productId}`)).toContainText("$12.00");

      // Delete with the inline confirmation (DELETE /products/[id]).
      await page.getByTestId(`product-delete-${productId}`).click();
      await page.getByTestId(`product-delete-${productId}-confirm`).click();
      await expect(page.getByTestId(`product-row-${productId}`)).toHaveCount(0);
      productId = null;
    } finally {
      if (productId) await apiDelete(request, `/products/${productId}`);
    }
  });

  test("creates, renames, and deletes a category", async ({ page, request }) => {
    const name = `E2E Category ${uniqueSuffix()}`;
    let categoryId: number | null = null;
    try {
      await loginAs(page, ADMIN.email, ADMIN.password);
      await expect(page).toHaveURL("/dashboard");
      await page.goto("/dashboard/categories");
      await expect(page.locator('[data-testid^="category-row-"]').first()).toBeVisible();

      await page.getByRole("button", { name: "+ Add category" }).click();
      const create = page.getByRole("dialog", { name: "Add a category" });
      await create.getByLabel("Name").fill(name);
      await create.getByRole("button", { name: "Create category" }).click();
      await expect(create).toBeHidden();

      const row = page.getByRole("row", { name: new RegExp(name) });
      await expect(row).toBeVisible();
      categoryId = Number((await row.getAttribute("data-testid"))?.replace("category-row-", ""));

      await page.getByTestId(`category-edit-${categoryId}`).click();
      const edit = page.getByRole("dialog", { name: "Edit category" });
      await expect(edit.getByLabel("Name")).toHaveValue(name);
      await edit.getByLabel("Name").fill(`${name} renamed`);
      await edit.getByRole("button", { name: "Save changes" }).click();
      await expect(edit).toBeHidden();
      await expect(page.getByTestId(`category-row-${categoryId}`)).toContainText(`${name} renamed`);

      await page.getByTestId(`category-delete-${categoryId}`).click();
      await page.getByTestId(`category-delete-${categoryId}-confirm`).click();
      await expect(page.getByTestId(`category-row-${categoryId}`)).toHaveCount(0);
      categoryId = null;
    } finally {
      if (categoryId) await apiDelete(request, `/categories/${categoryId}`);
    }
  });

  test("shows the backend error when deleting a product with active orders", async ({
    page,
    request,
  }) => {
    // Read-only: the backend refuses this delete, so nothing changes.
    const product = await findProductInActiveOrder(request);
    test.skip(!product, "No product is currently in an active order.");

    await openDashboard(page);
    await page.getByTestId(`product-delete-${product!.id}`).click();
    await page.getByTestId(`product-delete-${product!.id}-confirm`).click();
    await expect(page.getByTestId("dashboard-error")).toContainText(
      "Cannot delete product with active orders"
    );
    await expect(page.getByTestId(`product-row-${product!.id}`)).toBeVisible();
  });

  test("shows the backend error when deleting a category that has products", async ({
    page,
    request,
  }) => {
    // Read-only: the backend refuses this delete, so nothing changes.
    const category = await findCategoryWithProducts(request);
    test.skip(!category, "No category currently has products.");

    await loginAs(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL("/dashboard");
    await page.goto("/dashboard/categories");
    await page.getByTestId(`category-delete-${category!.id}`).click();
    await page.getByTestId(`category-delete-${category!.id}-confirm`).click();
    await expect(page.getByTestId("dashboard-error")).toContainText(
      "Cannot delete category that has products"
    );
    await expect(page.getByTestId(`category-row-${category!.id}`)).toBeVisible();
  });

  test("orders overview is read-only and lists each order's products", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL("/dashboard");
    await page.goto("/dashboard/orders");

    const firstRow = page.locator('[data-testid^="order-row-"]').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow).toContainText(/#\d+/);
    await expect(firstRow).toContainText(/\$\d+\.\d{2}/);
    await expect(firstRow.getByRole("listitem").first()).toBeVisible(); // product list
    await expect(page.getByRole("table").getByRole("button")).toHaveCount(0);
  });

  test("admins can't shop", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL("/dashboard");

    await page.goto("/products");
    await expect(page.getByRole("link", { name: "Manage in dashboard" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart" })).toHaveCount(0);

    await page.goto("/cart");
    await expect(page).toHaveURL("/dashboard");
  });
});
