import { test, expect } from "@playwright/test";

/**
 * Critical navigation flows — user bisa browse dari home ke semua halaman.
 */
test.describe("Navigation", () => {
  test("homepage loads with hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Baca Al-Qur'an/ })).toBeVisible();
  });

  test("drawer opens and closes", async ({ page }) => {
    await page.goto("/");

    // Open drawer
    await page.getByRole("button", { name: "Buka menu navigasi" }).click();
    await expect(page.getByRole("dialog", { name: "Menu navigasi" })).toBeVisible();

    // Close via X button
    await page.getByRole("button", { name: "Tutup menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu navigasi" })).not.toBeVisible();
  });

  test("can navigate to all main pages via drawer", async ({ page }) => {
    const pages = [
      { label: "Bookmark", heading: /Bookmark/i },
      { label: "Catatan", heading: /Catatan/i },
      { label: "Jadwal Sholat", heading: /Jadwal Sholat/i },
      { label: "Asmaul Husna", heading: /Asmaul Husna/i },
      { label: "Dzikir", heading: /Dzikir/i },
      { label: "Doa", heading: /Doa/i },
      { label: "Kalender", heading: /Kalender/i },
      { label: "Tentang", heading: /Tentang/i },
    ];

    for (const { label, heading } of pages) {
      await page.goto("/");
      await page.getByRole("button", { name: "Buka menu navigasi" }).click();
      await page.getByRole("link", { name: new RegExp(label) }).click();
      await expect(page.getByRole("heading", { name: heading })).toBeVisible({ timeout: 5000 });
    }
  });

  test("back button returns to previous page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Buka menu navigasi" }).click();
    await page.getByRole("link", { name: /Dzikir/ }).click();
    await expect(page).toHaveURL(/\/dzikir/);

    await page.getByRole("link", { name: /Kembali/ }).click();
    await expect(page).toHaveURL("/");
  });

  test("404 page for invalid routes", async ({ page }) => {
    await page.goto("/invalid-route");
    await expect(page.getByText(/Halaman Tidak Ditemukan/)).toBeVisible();
  });

  test("skip link focuses main content", async ({ page }) => {
    await page.goto("/");
    // Tab sekali untuk reveal skip link
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: /Lewati ke konten utama/ });
    await expect(skipLink).toBeFocused();
  });
});