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
});
