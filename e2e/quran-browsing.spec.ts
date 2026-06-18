import { test, expect } from "@playwright/test";

/**
 * Quran browsing — user bisa search, open surah, dan bookmark ayat.
 *
 * Test full flow:
 * 1. Search "Fatihah" di home
 * 2. Click Al-Fatihah card
 * 3. Bookmark ayat pertama
 * 4. Navigate ke bookmark page
 * 5. Verifikasi bookmark muncul
 */
test.describe("Quran Browsing", () => {
  test("search and open surah", async ({ page }) => {
    await page.goto("/");

    // Search "Fatihah"
    await page.getByPlaceholder(/Cari nama, arti/i).fill("Fatihah");

    // Click Al-Fatihah card
    await page.getByRole("link", { name: /Al-Fatihah/ }).first().click();
    await expect(page).toHaveURL(/\/surat\/1/);
    await expect(page.getByRole("heading", { name: /Al-Fatihah/ })).toBeVisible();
  });

  test("bookmark ayat and verify in bookmark page", async ({ page }) => {
    // Open Al-Fatihah
    await page.goto("/surat/1");
    await expect(page.getByRole("heading", { name: /Al-Fatihah/ })).toBeVisible();

    // Bookmark ayat 1
    await page.getByRole("button", { name: /Tambah bookmark/ }).first().click();
    await expect(page.getByText(/disimpan ke bookmark/i)).toBeVisible();

    // Navigate to bookmark page
    await page.getByRole("button", { name: "Buka menu navigasi" }).click();
    await page.getByRole("link", { name: /Bookmark/ }).click();

    // Verify bookmark visible
    await expect(page.getByRole("heading", { name: /Bookmark/ })).toBeVisible();
    await expect(page.getByText(/Al-Fatihah/).first()).toBeVisible();
  });

  test("search filters surah list", async ({ page }) => {
    await page.goto("/");

    // Initially show 114
    await expect(page.getByText(/114|dari 114/i)).toBeVisible();

    // Search "Baqarah" — only 1 result
    await page.getByPlaceholder(/Cari nama, arti/i).fill("Baqarah");
    await expect(page.getByRole("link", { name: /Al-Baqarah/ })).toBeVisible();

    // Search "xyz123" — empty state
    await page.getByPlaceholder(/Cari nama, arti/i).fill("xyz123");
    await expect(page.getByText(/Tidak ditemukan/)).toBeVisible();
  });

  test("open surah by clicking quick action", async ({ page }) => {
    await page.goto("/");

    // Click "Jadwal Sholat" quick action
    await page.getByRole("link", { name: /Buka halaman Sholat/ }).click();
    await expect(page).toHaveURL(/\/jadwal-sholat/);
  });
});