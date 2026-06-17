import { useState, useEffect } from "react";
import { WifiOff, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/use-pwa";
import { cn } from "@/lib/utils";

export function PWAStatusBar() {
  const { isOnline, isInstallable, isInstalled, promptInstall } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show install banner if installable and not already installed
    if (isInstallable && !isInstalled) {
      const wasDismissed = sessionStorage.getItem("pwa-install-dismissed");
      if (!wasDismissed) {
        // Delay to not be intrusive
        const timer = setTimeout(() => setShowInstallBanner(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  return (
    <>
      {/* Offline indicator */}
      {!isOnline && (
        <div
          className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium shadow-md"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" aria-hidden="true" />
            <span>Anda sedang offline. Menampilkan data yang tersimpan.</span>
          </div>
        </div>
      )}

      {/* Install PWA banner */}
      {showInstallBanner && !dismissed && (
        <div
          className="fixed left-2 right-2 sm:left-4 sm:right-4 z-50 bottom-20 md:bottom-4 animate-fade-in"
          role="dialog"
          aria-labelledby="pwa-install-title"
        >
          <div className="max-w-md mx-auto bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p id="pwa-install-title" className="font-semibold text-sm text-foreground">
                Install Al-Quran Digital
              </p>
              <p className="text-xs text-muted-foreground">
                Akses lebih cepat & dapat digunakan offline
              </p>
            </div>
            <Button
              size="sm"
              onClick={promptInstall}
              className="rounded-full shrink-0"
              aria-label="Install aplikasi Al-Quran Digital"
            >
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="shrink-0 w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              aria-label="Tutup banner install"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}