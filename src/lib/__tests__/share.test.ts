import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatVerseText, copyVerseToClipboard, shareVerseNative, canNativeShare } from "@/utils/share";
import type { Ayat } from "@/types/quran";

const mockAyat: Ayat = {
  nomorAyat: 1,
  teksArab: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  teksLatin: "Bismillāhir-raḥmānir-raḥīm",
  teksIndonesia: "Dengan nama Allah Yang Maha Pengasih.",
};

describe("formatVerseText", () => {
  it("includes surah, ayat, arabic, translation", () => {
    const result = formatVerseText({
      surahNumber: 1,
      surahName: "Al-Fatihah",
      ayat: mockAyat,
    });

    expect(result).toContain("QS. Al-Fatihah (1:1)");
    expect(result).toContain(mockAyat.teksArab);
    expect(result).toContain(mockAyat.teksIndonesia);
  });

  it("includes latin when present", () => {
    const result = formatVerseText({
      surahNumber: 1,
      surahName: "Al-Fatihah",
      ayat: mockAyat,
    });

    expect(result).toContain(mockAyat.teksLatin);
  });

  it("includes app URL when provided", () => {
    const result = formatVerseText({
      surahNumber: 1,
      surahName: "Al-Fatihah",
      ayat: mockAyat,
      appUrl: "https://example.com/surat/1",
    });

    expect(result).toContain("https://example.com/surat/1");
  });

  it("handles missing latin gracefully", () => {
    const ayatNoLatin = { ...mockAyat, teksLatin: "" };
    const result = formatVerseText({
      surahNumber: 1,
      surahName: "Al-Fatihah",
      ayat: ayatNoLatin,
    });

    // Should not have empty latin line
    expect(result).toContain(mockAyat.teksArab);
    expect(result).toContain(mockAyat.teksIndonesia);
  });
});

describe("copyVerseToClipboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("copies formatted text to clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText },
    });

    const result = await copyVerseToClipboard({
      surahNumber: 1,
      surahName: "Al-Fatihah",
      ayat: mockAyat,
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    const copiedText = writeText.mock.calls[0][0];
    expect(copiedText).toContain("QS. Al-Fatihah (1:1)");
    expect(result).toBe(true);
  });

  it("returns false on clipboard error", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Permission denied"));
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText },
    });

    const result = await copyVerseToClipboard({
      surahNumber: 1,
      surahName: "Al-Fatihah",
      ayat: mockAyat,
    });

    expect(result).toBe(false);
  });
});

describe("shareVerseNative", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("uses navigator.share when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      writable: true,
      value: share,
    });
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: vi.fn() },
    });

    const result = await shareVerseNative({
      surahNumber: 1,
      surahName: "Al-Fatihah",
      ayat: mockAyat,
    });

    expect(share).toHaveBeenCalledTimes(1);
    expect(share.mock.calls[0][0].title).toBe("QS. Al-Fatihah [1]");
    expect(result).toBe(true);
  });

  it("falls back to clipboard when share not available", async () => {
    Object.defineProperty(navigator, "share", {
      writable: true,
      value: undefined,
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText },
    });

    const result = await shareVerseNative({
      surahNumber: 1,
      surahName: "Al-Fatihah",
      ayat: mockAyat,
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it("returns false when user cancels share", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("User cancelled", "AbortError"));
    Object.defineProperty(navigator, "share", {
      writable: true,
      value: share,
    });
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: vi.fn() },
    });

    const result = await shareVerseNative({
      surahNumber: 1,
      surahName: "Al-Fatihah",
      ayat: mockAyat,
    });

    expect(result).toBe(false);
  });
});

describe("canNativeShare", () => {
  it("returns true when navigator.share exists", () => {
    Object.defineProperty(navigator, "share", {
      writable: true,
      value: vi.fn(),
    });
    expect(canNativeShare()).toBe(true);
  });

  it("returns false when navigator.share is missing", () => {
    Object.defineProperty(navigator, "share", {
      writable: true,
      value: undefined,
    });
    expect(canNativeShare()).toBe(false);
  });
});