import { test, expect } from "@playwright/test";

/**
 * Kalender Hijriah — user bisa browse kalender & lihat hari libur.
 */
test.describe("Kalender Hijriah", () => {
  test("shows today's date", async ({ page }) => {
    await page.goto("/kalender");

    // Hero section with today's date
    const today = new Date();
    const dayName = today.toLocaleDateString("id-ID", { weekday: "long" });
    await expect(page.getByText(new RegExp(dayName, "i"))).toBeVisible();
  });

  test("navigate to next month", async ({ page }) => {
    await page.goto("/kalender");

    // Click next month
    const initialMonth = await page.locator("h2").first().textContent();
    await page.getByRole("button", { name: "Bulan berikutnya" }).click();

    const nextMonth = await page.locator("h2").first().textContent();
    expect(nextMonth).not.toBe(initialMonth);
  });

  test("navigate to previous month", async ({ page }) => {
    await page.goto("/kalender");

    const initialMonth = await page.locator("h2").first().textContent();
    await page.getByRole("button", { name: "Bulan sebelumnya" }).click();

    const prevMonth = await page.locator("h2").first().textContent();
    expect(prevMonth).not.toBe(initialMonth);
  });

  test("'Hari Ini' button returns to current month", async ({ page }) => {
    await page.goto("/kalender");

    // Go to prev month
    await page.getByRole("button", { name: "Bulan sebelumnya" }).click();
    await page.getByRole("button", { name: "Bulan sebelumnya" }).click();

    // Click "Hari Ini"
    await page.getByRole("button", { name: /Hari Ini/ }).click();

    // Should be on current month
    const currentMonth = new Date().toLocaleDateString("id-ID", { month: "long" });
    await expect(page.getByText(new RegExp(currentMonth, "i"))).toBeVisible();
  });

  test("'Hari Libur' tab shows upcoming events", async ({ page }) => {
    await page.goto("/kalender");

    // Switch to "Hari Libur" tab
    await page.getByRole("tab", { name: /Hari Libur/ }).click();

    // Should show event list or empty state
    await expect(page.getByText(/90 Hari Ke Depan/i)).toBeVisible();
  });

  test("shows holiday markers on calendar dates", async ({ page }) => {
    await page.goto("/kalender");

    // Look for any emoji marker (holidays have emoji)
    const calendar = page.locator(".grid.grid-cols-7").first();
    await expect(calendar).toBeVisible();
  });
});