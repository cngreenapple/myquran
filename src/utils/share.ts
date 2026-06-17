import type { Ayat } from "@/types/quran";
import { showSuccess, showError } from "./toast";

interface ShareVerseOptions {
  surahNumber: number;
  surahName: string;
  ayat: Ayat;
  appUrl?: string;
}

function formatVerseText({ surahNumber, surahName, ayat, appUrl }: ShareVerseOptions): string {
  const lines = [
    `📖 QS. ${surahName} (${surahNumber}:${ayat.nomorAyat})`,
    "",
    ayat.teksArab,
    "",
    `"${ayat.teksIndonesia}"`,
  ];

  if (ayat.teksLatin) {
    lines.splice(4, 0, `${ayat.teksLatin}`);
  }

  if (appUrl) {
    lines.push("", `🔗 ${appUrl}`);
  }

  return lines.join("\n");
}

/**
 * Copy verse text to clipboard
 */
export async function copyVerseToClipboard(options: ShareVerseOptions): Promise<boolean> {
  try {
    const text = formatVerseText(options);
    await navigator.clipboard.writeText(text);
    showSuccess("Ayat disalin ke clipboard");
    return true;
  } catch (err) {
    console.error("[Share] Failed to copy", err);
    showError("Gagal menyalin ke clipboard");
    return false;
  }
}

/**
 * Use native Web Share API if available
 */
export async function shareVerseNative(options: ShareVerseOptions): Promise<boolean> {
  const text = formatVerseText(options);
  const { surahName, ayat } = options;
  const title = `QS. ${surahName} [${ayat.nomorAyat}]`;

  if (!navigator.share) {
    return copyVerseToClipboard(options);
  }

  try {
    await navigator.share({
      title,
      text,
    });
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return false; // User cancelled
    }
    console.error("[Share] Native share failed", err);
    // Fallback to clipboard
    return copyVerseToClipboard(options);
  }
}

/**
 * Check if native share is available
 */
export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && "share" in navigator;
}