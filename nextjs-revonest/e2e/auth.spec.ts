import { test, expect } from "@playwright/test";
import { ADMIN, CUSTOMER, loginAs } from "./helpers";

test.describe("Authentication", () => {
  test("registers a new account and logs the user in", async ({ page }) => {
    // Unique email so re-runs don't collide with the mock's in-memory state.
    const email = `new_${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel("Username").fill("newcustomer");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Password123");
    await page.getByLabel("Confirm password").fill("Password123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText(/Hi,\s*newcustomer/i)).toBeVisible();
  });

  test("logs in as a customer and persists across refresh", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, CUSTOMER.password);
    await expect(page).toHaveURL("/");
    await expect(page.getByText(/Hi,\s*okejohn/i)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/Hi,\s*okejohn/i)).toBeVisible();
  });

  test("shows an error on invalid credentials", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, "WrongPass9");
    await expect(
      page.getByText(/invalid email or password/i).first()
    ).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("admin logs in and is redirected to the dashboard", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("logged-out visitor is redirected away from the admin dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");
  });

  test("logged-in user is redirected away from /login and /register", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, CUSTOMER.password);
    await expect(page).toHaveURL("/");

    for (const path of ["/login", "/register"]) {
      await page.goto(path);
      await expect(page).toHaveURL("/");
    }
  });

  test("logout clears the session and goes to /login", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, CUSTOMER.password);
    await expect(page.getByText(/Hi,\s*okejohn/i)).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL("/login");

    // Session really is gone: a customer page now redirects to login.
    await page.goto("/orders");
    await expect(page).toHaveURL("/login");
  });

  test("product detail shows the category name", async ({ page }) => {
    await page.goto("/products/1");
    // Visible badge only (see screenshots.spec.ts for why), and exactly one.
    const category = page.getByTestId("product-category").filter({ visible: true });
    await expect(category).toHaveCount(1);
    await expect(category).toHaveText("Electronics");
  });

  test("logged-out visitor sees 'Login to buy' instead of Add to cart", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByText("Wireless Mouse").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart" })).toHaveCount(0);

    const loginToBuy = page.getByRole("link", { name: "Login to buy" }).first();
    await expect(loginToBuy).toBeVisible();
    await loginToBuy.click();
    await expect(page).toHaveURL("/login");
  });

  test("logged-out visitor is redirected from customer pages to login", async ({ page }) => {
    for (const path of ["/cart", "/checkout", "/orders"]) {
      await page.goto(path);
      await expect(page).toHaveURL("/login");
    }
  });

  test("admin cannot shop: no add-to-cart and customer pages redirect", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL("/dashboard");

    // No shopping controls on the catalog for admins.
    await page.goto("/products");
    await expect(page.getByText("Wireless Mouse").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Manage in dashboard" }).first()).toBeVisible();

    // Customer-only pages send admins to their dashboard.
    for (const path of ["/cart", "/checkout"]) {
      await page.goto(path);
      await expect(page).toHaveURL("/dashboard");
    }
  });
});
