import { test, expect } from "@playwright/test";

/**
 * Dzikir — user bisa tap counter dan complete dzikir items.
 */
test.describe("Dzikir", () => {
  test("tap counter increments and completes", async ({ page }) => {
    await page.goto("/dzikir");

    // Find first dzikir card
    const firstCard = page.locator('[role="tabpanel"]').first();
    const tapButton = firstCard.getByRole("button", { name: /Tap untuk Dzikir/ }).first();

    // Initial state: 0/3
    await expect(tapButton).toContainText("0/3");

    // Tap 3 times to complete
    await tapButton.click();
    await tapButton.click();
    await tapButton.click();

    // After completion: Selesai
    await expect(firstCard.getByText(/Selesai/)).toBeVisible();
  });

  test("switch between pagi and petang", async ({ page }) => {
    await page.goto("/dzikir");

    // Should be on Dzikir Pagi by default
    await expect(page.getByText(/Dzikir Pagi/i).first()).toBeVisible();

    // Switch to Dzikir Petang
    await page.getByRole("tab", { name: /Dzikir Petang/ }).click();
    await expect(page.getByText(/Dzikir Petang/i).first()).toBeVisible();
  });

  test("progress counter updates", async ({ page }) => {
    await page.goto("/dzikir");

    // Initial: 0 / N
    const progressText = page.locator('p:has-text("/")').first();
    await expect(progressText).toContainText("0");

    // Tap first item 3 times (default target)
    const tapButton = page.getByRole("button", { name: /Tap untuk Dzikir/ }).first();
    await tapButton.click();
    await tapButton.click();
    await tapButton.click();

    // Progress should now show 1
    await expect(progressText).toContainText("1");
  });

  test("works on mobile viewport", async ({ page, viewport }) => {
    if (!viewport) test.skip();
    await page.goto("/dzikir");
    await expect(page.getByRole("heading", { name: /Dzikir/ })).toBeVisible();
  });
});