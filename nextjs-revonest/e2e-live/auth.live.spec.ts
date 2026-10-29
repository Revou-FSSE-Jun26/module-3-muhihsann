import { test, expect } from "@playwright/test";
import { ADMIN, CUSTOMER, loginAs, uniqueSuffix } from "./live-helpers";

test.describe("Live: registration and login", () => {
  test("registers a new customer, who is logged in and can log out", async ({ page }) => {
    // Creates one real account per run (the API has no way to delete users).
    const id = uniqueSuffix();
    const username = `e2e_${id}`;

    await page.goto("/register");
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Email").fill(`e2e+${id}@test.com`);
    await page.getByLabel("Password", { exact: true }).fill("Password123");
    await page.getByLabel("Confirm password").fill("Password123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText(new RegExp(`Hi,\\s*${username}`))).toBeVisible();
    await expect(page.getByText("(customer)")).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("customer logs in and the session survives a refresh", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, CUSTOMER.password);
    await expect(page).toHaveURL("/");
    await expect(page.getByText(/Hi,\s*okejohn/i)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/Hi,\s*okejohn/i)).toBeVisible();
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, "WrongPassword9");
    await expect(page.getByText(/invalid email or password/i).first()).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("admin login goes to the dashboard", async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("logged-in customer is redirected away from /login and /register", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, CUSTOMER.password);
    await expect(page).toHaveURL("/");
    for (const path of ["/login", "/register"]) {
      await page.goto(path);
      await expect(page).toHaveURL("/");
    }
  });

  test("logged-out visitor is redirected from protected pages to /login", async ({ page }) => {
    for (const path of ["/cart", "/checkout", "/orders", "/dashboard", "/dashboard/orders"]) {
      await page.goto(path);
      await expect(page).toHaveURL("/login");
    }
  });

  test("customer is redirected away from the admin dashboard", async ({ page }) => {
    await loginAs(page, CUSTOMER.email, CUSTOMER.password);
    await expect(page).toHaveURL("/");
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/");
  });
});
