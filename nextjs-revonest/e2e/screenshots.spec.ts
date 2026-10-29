import { test } from "@playwright/test";
import { expect } from "@playwright/test";
import { ADMIN, CUSTOMER, loginAs } from "./helpers";

/**
 * Utility (not a behavioural test): drives the three graded flows and saves
 * HD, full-page PNGs to ./screenshots for the README / submission.
 *
 * Run with:  npx playwright test e2e/screenshots.spec.ts
 */
const DIR = "screenshots";

// Large viewport + 2x device scale factor => crisp, high-resolution images.
test.use({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

/** Wait for the green success notification, then full-page screenshot. */
async function shotAfterSuccess(
  page: import("@playwright/test").Page,
  path: string
) {
  await expect(page.getByRole("status").last()).toBeVisible();
  await page.screenshot({ path, fullPage: true });
}

test.describe("Capture flow screenshots", () => {
  test("public pages (logged out)", async ({ page }) => {
    // Home with featured products.
    await page.goto("/");
    await expect(page.getByText("Wireless Mouse").first()).toBeVisible();
    await page.screenshot({ path: `${DIR}/public-01-home.png`, fullPage: true });

    // Product listing as a visitor: cards show "Login to buy".
    await page.goto("/products");
    await expect(page.getByRole("link", { name: "Login to buy" }).first()).toBeVisible();
    await page.screenshot({ path: `${DIR}/public-02-products-login-to-buy.png`, fullPage: true });

    // Product detail with its category.
    await page.goto("/products/1");
    // Only count the badge the visitor can actually see. Next.js can keep a
    // hidden copy of a route in the page during navigation, which would
    // otherwise make this match twice.
    const category = page.getByTestId("product-category").filter({ visible: true });
    await expect(category).toHaveCount(1);
    await expect(category).toHaveText("Electronics");
    await page.screenshot({ path: `${DIR}/public-03-product-detail.png`, fullPage: true });

    // Categories listing (each card links to its filtered products).
    await page.goto("/categories");
    await expect(page.getByTestId("category-link-1")).toBeVisible();
    await page.screenshot({ path: `${DIR}/public-04-categories.png`, fullPage: true });

    // Clicking a category opens the filtered catalog.
    await page.getByTestId("category-link-1").click();
    await expect(page).toHaveURL(/category=1/);
    await expect(page.getByText("Wireless Mouse").first()).toBeVisible();
    await page.screenshot({ path: `${DIR}/public-05-category-filtered.png`, fullPage: true });
  });

  test("authentication flow", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
    await page.screenshot({ path: `${DIR}/auth-01-login.png`, fullPage: true });

    await page.goto("/register");
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
    await page.screenshot({ path: `${DIR}/auth-02-register.png`, fullPage: true });

    // Log in as a customer; capture the moment the welcome confirmation shows.
    await loginAs(page, CUSTOMER.email, CUSTOMER.password);
    await shotAfterSuccess(page, `${DIR}/auth-03-login-success.png`);

    await expect(page.getByText(/Hi,\s*okejohn/i)).toBeVisible();
    await page.screenshot({ path: `${DIR}/auth-04-logged-in.png`, fullPage: true });
  });

  test("shopping journey flow", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, CUSTOMER.password);

    await page.goto("/products");
    await expect(page.getByText("Wireless Mouse").first()).toBeVisible();
    await page.screenshot({ path: `${DIR}/shop-01-products.png`, fullPage: true });

    // Add an item; capture the confirmation.
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await shotAfterSuccess(page, `${DIR}/shop-02-add-to-cart.png`);

    await page.getByRole("button", { name: /Cart with/ }).click();
    await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();
    await page.screenshot({ path: `${DIR}/shop-03-cart-preview.png`, fullPage: true });

    await page.getByRole("button", { name: "Checkout" }).click();
    await expect(page).toHaveURL("/checkout");
    await page.screenshot({ path: `${DIR}/shop-04-checkout.png`, fullPage: true });

    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page).toHaveURL("/orders");
    await shotAfterSuccess(page, `${DIR}/shop-05-order-placed.png`);

    await expect(page.getByText(/Order #/).first()).toBeVisible();
    await page.screenshot({ path: `${DIR}/shop-06-orders.png`, fullPage: true });
  });

  test("admin dashboard CRUD flow", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByTestId("product-row-1")).toBeVisible();
    // Product management table at /dashboard.
    await page.screenshot({ path: `${DIR}/admin-01-dashboard.png`, fullPage: true });

    // CreateProductForm in its modal, filled in. (Viewport shot keeps the
    // dimmed backdrop and the modal in frame.)
    await page.getByRole("button", { name: "+ Add product" }).click();
    const create = page.getByRole("dialog", { name: "Add a product" });
    await create.getByLabel("Name").fill("Desk Lamp");
    await create.getByLabel("Category").selectOption({ label: "Electronics" });
    await create.getByLabel(/Price/).fill("35");
    await create.getByLabel("Stock quantity").fill("20");
    await create.getByLabel(/Description/).fill("Adjustable LED desk lamp");
    await page.screenshot({ path: `${DIR}/admin-02-product-form.png` });

    await create.getByRole("button", { name: "Create product" }).click();
    await expect(page.getByRole("row", { name: /Desk Lamp/ })).toBeVisible();
    await shotAfterSuccess(page, `${DIR}/admin-03-product-created.png`);

    // EditProductForm, pre-populated from GET /products/[id].
    await page.getByTestId("product-edit-1").click();
    const edit = page.getByRole("dialog", { name: "Edit product" });
    await expect(edit.getByLabel("Name")).toHaveValue("Wireless Mouse");
    await page.screenshot({ path: `${DIR}/admin-07-edit-product.png` });
    await edit.getByRole("button", { name: "Cancel" }).click();

    // Inline delete confirmation, then the backend refusing (active orders).
    await page.getByTestId("product-delete-2").click();
    await page.screenshot({ path: `${DIR}/admin-08-delete-confirm.png`, fullPage: true });
    await page.getByTestId("product-delete-2-confirm").click();
    await expect(page.getByTestId("dashboard-error")).toBeVisible();
    await page.screenshot({ path: `${DIR}/admin-09-delete-blocked.png`, fullPage: true });

    // Category management.
    await page.goto("/dashboard/categories");
    await expect(page.getByTestId("category-row-1")).toBeVisible();
    await page.screenshot({ path: `${DIR}/admin-04-categories.png`, fullPage: true });

    // CreateCategoryForm (name only) in its modal.
    await page.getByRole("button", { name: "+ Add category" }).click();
    const createCategory = page.getByRole("dialog", { name: "Add a category" });
    await createCategory.getByLabel("Name").fill("Gardening");
    await page.screenshot({ path: `${DIR}/admin-10-category-form.png` });
    await createCategory.getByRole("button", { name: "Create category" }).click();
    await expect(page.getByRole("row", { name: /Gardening/ })).toBeVisible();
    await shotAfterSuccess(page, `${DIR}/admin-05-category-created.png`);

    // Read-only orders overview with product lists.
    await page.goto("/dashboard/orders");
    await expect(page.getByTestId("order-row-1")).toContainText("Mechanical Keyboard");
    await page.screenshot({ path: `${DIR}/admin-06-orders.png`, fullPage: true });
  });
});
