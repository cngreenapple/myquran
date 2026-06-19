import { useEffect, useState } from "react";

/**
 * useScrollVisibility — track window scroll position untuk show/hide UI elements.
 *
 * Performance:
 * - Pakai `requestAnimationFrame` untuk throttle update supaya tidak
 *   trigger re-render tiap scroll event (~60 events/detik).
 * - `passive: true` di scroll listener untuk better scroll perf
 *   (browser tidak perlu tunggu listener selesai sebelum scroll).
 * - Cleanup proper: `removeEventListener` + `cancelAnimationFrame` di unmount.
 *
 * Returns: boolean visible (true kalau `window.scrollY > threshold`).
 *
 * Note: Pakai `window.scrollY` bukan `document.querySelector("main").scrollTop`
 * karena page-level scroll terjadi di window (default browser behavior).
 * `<main>` element tidak punya `overflow-y: auto` — content flows normally.
 */
export function useScrollVisibility(threshold: number = 300): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const update = () => {
      setVisible(window.scrollY > threshold);
      rafId = null;
    };

    const handleScroll = () => {
      // Throttle: max 1 update per frame (~16ms)
      if (rafId === null) {
        rafId = requestAnimationFrame(update);
      }
    };

    // Initial check (handle reload saat user kembali ke page yang sudah scroll)
    update();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [threshold]);

  return visible;
}