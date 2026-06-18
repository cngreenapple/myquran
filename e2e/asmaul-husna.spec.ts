import { test, expect } from "@playwright/test";

/**
 * Asmaul Husna — user bisa browse 99 nama Allah.
 */
test.describe("Asmaul Husna", () => {
  test("displays 99 nama in grid view", async ({ page }) => {
    await page.goto("/asmaul-husna");

    // Should show 99 nama
    await expect(page.getByText(/99 dari 99 nama|99 nama/)).toBeVisible();
  });

  test("open detail dialog by clicking a card", async ({ page }) => {
    await page.goto("/asmaul-husna");

    // Click first card (Asma #1 - Ar-Rahman)
    await page.locator('[role="list"] button').first().click();

    // Dialog should open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Ar-Raḥmān/)).toBeVisible();
  });

  test("search filters asma", async ({ page }) => {
    await page.goto("/asmaul-husna");

    // Search "Rahman"
    await page.getByPlaceholder(/Cari nama, arti/i).fill("Rahman");

    // Should show only matching asma
    await expect(page.getByText(/Ar-Raḥmān/).first()).toBeVisible();
  });

  test("navigate to next asma in dialog", async ({ page }) => {
    await page.goto("/asmaul-husna");

    // Open first asma
    await page.locator('[role="list"] button').first().click();
    await expect(page.getByText(/Asma # 1/)).toBeVisible();

    // Click "Selanjutnya"
    await page.getByRole("button", { name: /Selanjutnya/ }).click();
    await expect(page.getByText(/Asma # 2/)).toBeVisible();
  });

  test("copy asma to clipboard", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/asmaul-husna");
    await page.locator('[role="list"] button').first().click();

    // Click copy button
    await page.getByRole("button", { name: /Copy/ }).click();

    // Verify toast
    await expect(page.getByText(/Tersalin ke clipboard/)).toBeVisible();
  });

  test("switch between grid and list view", async ({ page }) => {
    await page.goto("/asmaul-husna");

    // Initial: grid view (3-4 columns)
    const gridList = page.getByRole("list", { name: /Daftar Asmaul Husna/ });
    await expect(gridList).toBeVisible();

    // Switch to list view
    await page.getByRole("button", { name: /Tampilan daftar/ }).click();

    // Different list now
    const detailList = page.getByRole("list");
    await expect(detailList.first()).toBeVisible();
  });
});