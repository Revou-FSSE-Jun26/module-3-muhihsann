import { test, expect } from "@playwright/test";
import { ADMIN, loginAs } from "./helpers";

test.describe("Admin dashboard CRUD", () => {
  test("creates, edits, and deletes a product", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL("/dashboard");

    await page.goto("/dashboard/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

    // Create
    await page.getByPlaceholder("e.g. Wireless Keyboard").fill("Test Lamp");
    await page.getByRole("combobox").selectOption({ label: "Electronics" });
    await page.getByPlaceholder("e.g. 25").fill("30");
    await page.getByPlaceholder("e.g. 100").fill("12");
    await page.getByRole("button", { name: "Add product" }).click();

    const row = page.getByRole("row", { name: /Test Lamp/ });
    await expect(row).toBeVisible();
    // Grab the new product's id from its row testid for stable targeting.
    const testId = await row.getAttribute("data-testid");
    const id = Number(testId?.replace("product-row-", ""));
    expect(id).toBeGreaterThan(0);

    // Edit
    await page.getByTestId(`product-edit-${id}`).click();
    await expect(page.getByRole("heading", { name: /Editing product/ })).toBeVisible();
    await page.getByPlaceholder("e.g. Wireless Keyboard").fill("Test Lamp Deluxe");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByTestId(`product-row-${id}`)).toContainText("Test Lamp Deluxe");

    // Delete (accept the confirm dialog)
    page.on("dialog", (d) => d.accept());
    await page.getByTestId(`product-delete-${id}`).click();
    await expect(page.getByTestId(`product-row-${id}`)).toHaveCount(0);
  });

  test("creates a category and rejects a duplicate name", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);

    await page.goto("/dashboard/categories");
    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

    const unique = `Gardening_${Date.now()}`;
    await page.getByPlaceholder("e.g. Toys").fill(unique);
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText(unique)).toBeVisible();

    // Duplicate of a seeded category -> 409 surfaced as an error.
    await page.getByPlaceholder("e.g. Toys").fill("Electronics");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText(/already exists/i).first()).toBeVisible();
  });
});
