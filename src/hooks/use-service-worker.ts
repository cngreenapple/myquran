import { useEffect } from "react";

/**
 * Register Service Worker untuk PWA installability.
 *
 * Browser TIDAK akan fire `beforeinstallprompt` event kalau
 * Service Worker belum registered. Ini adalah salah satu criteria
 * wajib PWA installability.
 *
 * Hook ini handle:
 * - Auto-register `sw.js` di root
 * - Listen untuk update event → reload page (seamless update)
 * - Error handling yang silent (gagal register = gak critical,
 *   app tetap jalan normal tanpa offline support)
 */
export function useServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Register di root scope `/`
    const swUrl = "/sw.js";

    navigator.serviceWorker
      .register(swUrl, { scope: "/" })
      .then((registration) => {
        console.log("[SW] Registered:", registration.scope);

        // Check update setiap kali halaman dimuat
        registration.update().catch((err) => {
          console.warn("[SW] Update check failed", err);
        });

        // Listen untuk update — kalau ada SW baru, reload supaya
        // user langsung pakai versi terbaru
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New SW installed tapi belum active. Force activate
              // supaya user tidak stuck di versi lama.
              console.log("[SW] New version installed, activating...");
              newWorker.postMessage("SKIP_WAITING");
              window.location.reload();
            }
          });
        });
      })
      .catch((err) => {
        // Silent fail — PWA optional, app tetap jalan tanpa offline
        console.warn("[SW] Registration failed", err);
      });
  }, []);
}