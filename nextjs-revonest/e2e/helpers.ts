import type { Page } from "@playwright/test";

/**
 * Seed accounts that the mock API (e2e/mock-server.mjs) always starts with.
 * Tests reference these rather than hitting a real backend.
 */
export const ADMIN = { email: "admin@revonest.com", password: "Admin123", username: "admin" };
export const CUSTOMER = { email: "okejohn@email.com", password: "Password123", username: "okejohn" };

/** Log in through the UI with the given credentials. */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}
