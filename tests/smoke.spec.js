import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Each test gets a fresh browser context, so localStorage starts empty
  // and the app falls back to its mock seed data.
  await page.goto("/");
});

test("dashboard renders the header and summary stats", async ({ page }) => {
  await expect(page.getByText("Relay")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
  await expect(page.getByText("Active stores")).toBeVisible();
  await expect(page.getByText("Units in stock")).toBeVisible();
  await expect(page.getByText("Low stock")).toBeVisible();
});

test("navigates between tabs", async ({ page }) => {
  await page.getByRole("button", { name: "Inventory" }).click();
  await expect(page.getByRole("columnheader", { name: "SKU" })).toBeVisible();

  await page.getByRole("button", { name: "Transfers" }).click();
  await expect(page.getByRole("heading", { name: "Transfer requests" })).toBeVisible();
  await expect(page.getByText("Transfer status timeline")).toBeVisible();

  await page.getByRole("button", { name: "Insights" }).click();
  await expect(page.getByRole("heading", { name: "AI recommendations" })).toBeVisible();
});

test("approving suggestions removes them and shows the empty state", async ({ page }) => {
  const approveButtons = page.getByRole("button", { name: "Approve" });
  await expect(approveButtons).toHaveCount(2);

  await approveButtons.first().click();
  await expect(approveButtons).toHaveCount(1);

  await approveButtons.first().click();
  await expect(page.getByText("You're all balanced")).toBeVisible();
});

test("inventory search shows an empty state when nothing matches", async ({ page }) => {
  await page.getByRole("button", { name: "Inventory" }).click();
  await page.getByPlaceholder("Search products, SKUs, or stores").fill("zzz-no-match");
  await expect(page.getByText("No inventory items found.")).toBeVisible();
});

test("approved transfers persist across a reload", async ({ page }) => {
  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByRole("button", { name: "Approve" })).toHaveCount(1);

  await page.reload();

  // The remaining (un-approved) suggestion is still the only one left.
  await expect(page.getByRole("button", { name: "Approve" })).toHaveCount(1);
});

test("recovers from stale or corrupt persisted state instead of crashing", async ({ page }) => {
  // Simulate a browser whose localStorage holds data from an older app shape:
  // transfers as a non-array, and a settings object missing its `stores` array.
  await page.addInitScript(() => {
    window.localStorage.setItem("retail-transfer:transfers", JSON.stringify("not-an-array"));
    window.localStorage.setItem("retail-transfer:settings", JSON.stringify({ company: { name: "Stale Co" } }));
  });

  await page.goto("/");

  // App still renders rather than throwing on .map/.reduce/destructure.
  await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();

  // Settings tab renders its store list (filled from defaults, not the stale object).
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Store Management" })).toBeVisible();
});

test("dark mode toggles and persists across reload", async ({ page }) => {
  await page.goto("/");
  const root = page.locator("html");

  // Force a known starting point regardless of OS preference.
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));

  const toggle = page.getByRole("button", { name: /switch to dark mode/i });
  await toggle.click();
  await expect(root).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "dark");

  // And it can switch back.
  await page.getByRole("button", { name: /switch to light mode/i }).click();
  await expect(root).toHaveAttribute("data-theme", "light");
});
