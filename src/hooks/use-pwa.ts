import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Register service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.log("[PWA] Service workers not supported");
      return;
    }

    // Only register in production, but for PWA testing we register always
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        console.log("[PWA] Service worker registered:", registration.scope);

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("[PWA] Update available");
              setUpdateAvailable(true);
              toast.info("Versi baru tersedia", {
                description: "Klik untuk memperbarui aplikasi.",
                action: {
                  label: "Update",
                  onClick: () => applyUpdate(registration),
                },
                duration: 10000,
              });
            }
          });
        });

        // If there's already a waiting worker
        if (registration.waiting) {
          setUpdateAvailable(true);
        }
      } catch (err) {
        console.error("[PWA] Service worker registration failed:", err);
      }
    };

    registerSW();
  }, []);

  // Install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setInstallPrompt(event);
      setIsInstallable(true);
      console.log("[PWA] Install prompt available");
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed (Android: display-mode, iOS: navigator.standalone)
    const isStandaloneDisplay = window.matchMedia("(display-mode: standalone)").matches;
    const isIOSStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandaloneDisplay || isIOSStandalone) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Koneksi tersambung kembali", { duration: 2000 });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Anda offline", {
        description: "Beberapa fitur mungkin terbatas.",
        duration: 3000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) {
      toast.error("Aplikasi tidak dapat diinstall saat ini");
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      console.log("[PWA] Install choice:", choice.outcome);

      if (choice.outcome === "accepted") {
        toast.success("Aplikasi sedang diinstall...");
        setIsInstalled(true);
      } else {
        toast.info("Install dibatalkan");
      }

      setInstallPrompt(null);
      setIsInstallable(false);
    } catch (err) {
      console.error("[PWA] Install prompt failed:", err);
      toast.error("Gagal menampilkan prompt install");
    }
  }, [installPrompt]);

  const applyUpdate = useCallback((registration?: ServiceWorkerRegistration) => {
    const apply = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        reg.waiting.addEventListener("statechange", () => {
          if (reg.waiting?.state === "activated") {
            window.location.reload();
          }
        });
      }
    };

    if (registration) {
      apply(registration);
    } else {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) apply(reg);
      });
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    promptInstall,
    applyUpdate: () => applyUpdate(),
  };
}