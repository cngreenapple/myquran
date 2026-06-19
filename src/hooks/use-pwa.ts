import { useState, useEffect, useCallback } from "react";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type PWAInstallState = "unknown" | "available" | "installed" | "unsupported";

interface UsePWAReturn {
  /** Apakah device sedang online */
  isOnline: boolean;
  /** Apakah install prompt tersedia (belum di-install, browser support) */
  isInstallable: boolean;
  /** Apakah app sudah ter-install sebagai PWA */
  isInstalled: boolean;
  /** Install state — berguna untuk conditional render */
  installState: PWAInstallState;
  /** Trigger native install prompt */
  promptInstall: () => Promise<boolean>;
}

/**
 * Detect apakah app berjalan sebagai installed PWA.
 *
 * Check 3 cara (urutan prioritas):
 * 1. iOS Safari: `navigator.standalone === true`
 * 2. Modern browsers: `window.matchMedia('(display-mode: standalone)').matches`
 * 3. Android Chrome TWA: `document.referrer.includes('android-app://')`
 */
function checkIsInstalled(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari
  const nav = navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  // Standard PWA display mode
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // Android Chrome TWA
  if (document.referrer?.includes("android-app://")) return true;
  return false;
}

const INSTALLED_CHECK_INTERVAL = 1000; // 1 detik

/**
 * usePWA — central hook untuk PWA lifecycle management.
 *
 * Responsibilities:
 * - Track online/offline state (navigator.onLine + events)
 * - Capture & cache beforeinstallprompt event
 * - Detect installed state (standalone / iOS standalone)
 * - Provide promptInstall() untuk trigger native install dialog
 *
 * Browser support:
 * - beforeinstallprompt: Chrome/Edge 67+, Samsung Internet, Opera
 * - iOS Safari: tidak support beforeinstallprompt (user harus manual via Share)
 * - Firefox: tidak support (status: behind flag)
 *
 * Untuk unsupported browsers, `isInstallable` selalu false.
 */
export function usePWA(): UsePWAReturn {
  // Init state: SSR-safe (default true untuk online, false untuk installed)
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsInstalled());
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  // Track online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial state (in case changed between mount dan useState init)
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Re-check installed state periodically
  // (mis. user install PWA dari address bar tanpa trigger beforeinstallprompt)
  useEffect(() => {
    const interval = setInterval(() => {
      const installed = checkIsInstalled();
      setIsInstalled((prev) => (prev !== installed ? installed : prev));
    }, INSTALLED_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Capture beforeinstallprompt event
  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent default — browser akan show default install banner kalau tidak di-prevent
      e.preventDefault();
      // Cache event untuk dipakai nanti
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detect kalau app sudah ter-install (event fired dengan outcome: 'installed')
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null); // Clear — tidak bisa install lagi
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!installPromptEvent) return false;

    try {
      await installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;

      // Clear event — hanya bisa dipakai sekali per session
      setInstallPromptEvent(null);

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[PWA] Install prompt failed", err);
      return false;
    }
  }, [installPromptEvent]);

  const isInstallable = installPromptEvent !== null && !isInstalled;

  const installState: PWAInstallState = isInstalled
    ? "installed"
    : isInstallable
      ? "available"
      : "unsupported";

  return {
    isOnline,
    isInstallable,
    isInstalled,
    installState,
    promptInstall,
  };
}