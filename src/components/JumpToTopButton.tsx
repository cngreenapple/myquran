threshold. Click → smooth scroll ke top. Mount di AppShell sekali supaya otomatis ada di semua route. Z-index strategy dokumentasikan untuk konsistensi dengan AudioPlayer, Header, PWAStatusBar.">
import { ArrowUp } from "lucide-react";
import { useScrollVisibility } from "@/hooks/use-scroll";

interface JumpToTopButtonProps {
  /** Scroll threshold (px) untuk button muncul. Default 300. */
  threshold?: number;
}

/**
 * Global Jump-to-Top button.
 *
 * Floating button yang muncul saat user scroll window > threshold.
 * Click → smooth scroll ke top.
 *
 * Mount di AppShell (App.tsx) sekali supaya single instance,
 * otomatis detect scroll di SEMUA route.
 *
 * Z-index strategy (low to high):
 * - z-30:   JumpToTopButton
 * - z-40:   AudioPlayer global
 * - z-[80]: AppDrawer overlay
 * - z-[90]: AppDrawer panel
 * - z-[95]: Drawer variant scroll-to-top (di dalam drawer context)
 * - z-[1000]: Header (fixed top)
 * - z-[1100]: PWAStatusBar (offline indicator + install banner)
 *
 * Position: fixed bottom-24 right-4
 * - Mobile: AudioPlayer di bottom-14 (56px), tinggi ~50px → top edge ~106px.
 *   JumpToTop bottom edge 96px, top edge ~140px → tidak overlap.
 *   AudioPlayer full-width (left-0 right-0), JumpToTop di right corner → coexist OK.
 * - Desktop: AudioPlayer di bottom-3 (12px), tinggi ~50px → top edge ~62px.
 *   JumpToTop bottom edge 96px → ada gap jelas, tidak overlap.
 *
 * Saat PWA install banner muncul (bottom-24 z-1100), banner cover JumpToTop.
 * Setelah banner dismissed, JumpToTop muncul clear.
 */
export function JumpToTopButton({ threshold = 300 }: JumpToTopButtonProps) {
  const visible = useScrollVisibility(threshold);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-4 z-30 w-11 h-11 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center hover:bg-muted active:scale-95 transition-all animate-fade-in"
      aria-label="Scroll ke atas"
    >
      <ArrowUp className="w-5 h-5 text-foreground" aria-hidden="true" />
    </button>
  );
}