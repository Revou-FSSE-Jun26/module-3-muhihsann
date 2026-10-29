import { test, expect, type Page } from "@playwright/test";
import { ADMIN, loginAs } from "./helpers";

/** Log in as admin and wait for the product table on /dashboard. */
async function openDashboard(page: Page) {
  await loginAs(page, ADMIN.email, ADMIN.password);
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  await expect(page.getByTestId("product-row-1")).toBeVisible();
}

test.describe("Admin dashboard CRUD", () => {
  test("creates, edits, and deletes a product", async ({ page }) => {
    await openDashboard(page);

    // Create — CreateProductForm in a modal (POST /products).
    await page.getByRole("button", { name: "+ Add product" }).click();
    const createModal = page.getByRole("dialog", { name: "Add a product" });
    await expect(createModal).toBeVisible();
    await createModal.getByLabel("Name").fill("Test Lamp");
    await createModal.getByLabel("Category").selectOption({ label: "Electronics" });
    await createModal.getByLabel(/Price/).fill("30");
    await createModal.getByLabel("Stock quantity").fill("12");
    await createModal.getByRole("button", { name: "Create product" }).click();
    await expect(createModal).toBeHidden();

    const row = page.getByRole("row", { name: /Test Lamp/ });
    await expect(row).toBeVisible();
    const id = Number((await row.getAttribute("data-testid"))?.replace("product-row-", ""));
    expect(id).toBeGreaterThan(0);

    // Edit — EditProductForm in a modal, pre-populated from GET /products/[id].
    await page.getByTestId(`product-edit-${id}`).click();
    const editModal = page.getByRole("dialog", { name: "Edit product" });
    await expect(editModal.getByLabel("Name")).toHaveValue("Test Lamp");
    await expect(editModal.getByLabel(/Price/)).toHaveValue("30");
    await editModal.getByLabel("Name").fill("Test Lamp Deluxe");
    await editModal.getByRole("button", { name: "Save changes" }).click();
    await expect(editModal).toBeHidden();
    await expect(page.getByTestId(`product-row-${id}`)).toContainText("Test Lamp Deluxe");

    // Delete — inline confirmation, then DELETE /products/[id].
    await page.getByTestId(`product-delete-${id}`).click();
    await expect(page.getByRole("group", { name: /Confirm deleting Test Lamp Deluxe/ })).toBeVisible();
    await page.getByTestId(`product-delete-${id}-confirm`).click();
    await expect(page.getByTestId(`product-row-${id}`)).toHaveCount(0);
  });

  test("validates the product form before submitting", async ({ page }) => {
    await openDashboard(page);
    await page.getByRole("button", { name: "+ Add product" }).click();
    const modal = page.getByRole("dialog", { name: "Add a product" });
    await modal.getByRole("button", { name: "Create product" }).click();

    await expect(modal.getByText("Name is required.")).toBeVisible();
    await expect(modal.getByText("Choose a category.")).toBeVisible();
    await expect(modal.getByText("Price is required.")).toBeVisible();
    // Still open: nothing was sent.
    await expect(modal).toBeVisible();
  });

  test("shows the backend error when deleting a product with active orders", async ({ page }) => {
    await openDashboard(page);

    // The mock seeds a pending order containing the Mechanical Keyboard (id 2).
    await page.getByTestId("product-delete-2").click();
    await page.getByTestId("product-delete-2-confirm").click();

    await expect(page.getByTestId("dashboard-error")).toContainText(
      "Cannot delete product with active orders"
    );
    await expect(page.getByTestId("product-row-2")).toBeVisible();
  });

  test("cancelling the inline confirmation keeps the product", async ({ page }) => {
    await openDashboard(page);
    await page.getByTestId("product-delete-1").click();
    await page.getByRole("group", { name: /Confirm deleting/ }).getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByTestId("product-delete-1")).toBeVisible();
    await expect(page.getByTestId("product-row-1")).toBeVisible();
  });

  test("creates, renames, and deletes a category", async ({ page }) => {
    await openDashboard(page);
    await page.getByRole("link", { name: "Categories" }).last().click();
    await expect(page).toHaveURL("/dashboard/categories");
    await expect(page.getByRole("heading", { name: "Categories", level: 2 })).toBeVisible();

    // Create — CreateCategoryForm (name only) in a modal.
    const name = `Gardening ${Date.now()}`;
    await page.getByRole("button", { name: "+ Add category" }).click();
    const createModal = page.getByRole("dialog", { name: "Add a category" });
    await createModal.getByLabel("Name").fill(name);
    await createModal.getByRole("button", { name: "Create category" }).click();
    await expect(createModal).toBeHidden();

    const row = page.getByRole("row", { name: new RegExp(name) });
    await expect(row).toBeVisible();
    const id = Number((await row.getAttribute("data-testid"))?.replace("category-row-", ""));

    // Edit — EditCategoryForm pre-populated with the existing name.
    await page.getByTestId(`category-edit-${id}`).click();
    const editModal = page.getByRole("dialog", { name: "Edit category" });
    await expect(editModal.getByLabel("Name")).toHaveValue(name);
    await editModal.getByLabel("Name").fill(`${name} Renamed`);
    await editModal.getByRole("button", { name: "Save changes" }).click();
    await expect(editModal).toBeHidden();
    await expect(page.getByTestId(`category-row-${id}`)).toContainText(`${name} Renamed`);

    // Delete — inline confirmation.
    await page.getByTestId(`category-delete-${id}`).click();
    await page.getByTestId(`category-delete-${id}-confirm`).click();
    await expect(page.getByTestId(`category-row-${id}`)).toHaveCount(0);
  });

  test("validates the category name and rejects duplicates", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await page.goto("/dashboard/categories");
    await page.getByRole("button", { name: "+ Add category" }).click();
    const modal = page.getByRole("dialog", { name: "Add a category" });

    // Empty name is caught before calling the API.
    await modal.getByRole("button", { name: "Create category" }).click();
    await expect(modal.getByText("Category name is required.")).toBeVisible();

    // Duplicate of a seeded category -> API 409, shown in the form.
    await modal.getByLabel("Name").fill("Electronics");
    await modal.getByRole("button", { name: "Create category" }).click();
    await expect(modal.getByText(/already exists/i)).toBeVisible();
  });

  test("shows the backend error when deleting a category that has products", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await page.goto("/dashboard/categories");

    // Electronics (id 1) still has products.
    await page.getByTestId("category-delete-1").click();
    await page.getByTestId("category-delete-1-confirm").click();
    await expect(page.getByTestId("dashboard-error")).toContainText(
      "Cannot delete category that has products"
    );
    await expect(page.getByTestId("category-row-1")).toBeVisible();
  });

  test("orders overview is read-only and lists each order's products", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await page.goto("/dashboard/orders");

    const row = page.getByTestId("order-row-1");
    await expect(row).toBeVisible();
    await expect(row).toContainText("#1");
    await expect(row).toContainText("99"); // user id
    await expect(row).toContainText("Mechanical Keyboard");
    await expect(row).toContainText("$90.00");

    // Read-only: no buttons in the orders table.
    await expect(page.getByRole("table").getByRole("button")).toHaveCount(0);
  });

  test("old /dashboard/products URL redirects to /dashboard", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await page.goto("/dashboard/products");
    await expect(page).toHaveURL("/dashboard");
  });
});
