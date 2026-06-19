import { NavLink, useLocation } from "react-router-dom";
import {
  Home, Bookmark, StickyNote, Clock, Star, BookHeart, Hand,
  Compass, Moon, Calendar, Video, Info, X, ArrowUp, Settings,
  CircleDot, Download, Check, Share, Plus,
} from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { usePWA } from "@/hooks/use-pwa";
import { showSuccess, showError } from "@/utils/toast";

interface AppDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
};

const PRIMARY: NavItem[] = [
  { to: "/", label: "Beranda", icon: Home, end: true },
  { to: "/bookmark", label: "Bookmark", icon: Bookmark },
  { to: "/catatan", label: "Catatan", icon: StickyNote },
];

const IBADAH: NavItem[] = [
  { to: "/jadwal-sholat", label: "Jadwal Sholat", icon: Clock },
  { to: "/arah-kiblat", label: "Arah Kiblat", icon: Compass },
  { to: "/dzikir", label: "Dzikir", icon: BookHeart },
  { to: "/tasbih", label: "Tasbih", icon: CircleDot },
  { to: "/doa", label: "Doa", icon: Hand },
];

const KONTEN: NavItem[] = [
  { to: "/asmaul-husna", label: "Asmaul Husna", icon: Star },
  { to: "/kalender", label: "Kalender Islam", icon: Calendar },
  { to: "/puasa-sunnah", label: "Puasa Sunnah", icon: Moon },
  { to: "/live-makkah", label: "Live Makkah", icon: Video },
];

const LAINNYA: NavItem[] = [
  { to: "/settings", label: "Pengaturan", icon: Settings },
  { to: "/tentang", label: "Tentang", icon: Info },
];

const SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  { title: "Pribadi", items: PRIMARY },
  { title: "Ibadah", items: IBADAH },
  { title: "Konten", items: KONTEN },
  { title: "Lainnya", items: LAINNYA },
];

/**
 * Detect iOS Safari specifically (not just any Safari on any OS).
 *
 * iPadOS reports as Mac in userAgent since iPadOS 13 — pakai
 * `navigator.maxTouchPoints > 0` + Mac UA sebagai fallback.
 *
 * Returns true hanya kalau device iOS/iPadOS + browser Safari/Chrome/Firefox on iOS.
 */
function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPhone/iPod
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ reports as Mac + touch
  if (
    ua.includes("Mac") &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 0
  ) {
    return true;
  }
  return false;
}

export function AppDrawer({ open, onOpenChange }: AppDrawerProps) {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else if (mounted) {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(timer);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (open) {
      const main = document.querySelector("main");
      if (main) {
        setShowScrollTop(main.scrollTop > 200);
        const handler = () => setShowScrollTop(main.scrollTop > 200);
        main.addEventListener("scroll", handler);
        return () => main.removeEventListener("scroll", handler);
      }
    }
  }, [open, location.pathname]);

  useEffect(() => { onOpenChange(false); /* eslint-disable-next-line */ }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const handleScrollTop = () => {
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Trigger native install prompt (Android/Desktop Chrome only).
   */
  const handleInstall = async () => {
    try {
      const accepted = await promptInstall();
      if (accepted) {
        showSuccess("Aplikasi berhasil di-install! 🎉");
      } else {
        showError("Install dibatalkan");
      }
      onOpenChange(false);
    } catch (err) {
      console.error("[Install] Failed", err);
      showError("Gagal menampilkan prompt install");
    }
  };

  return (
    <>
      {mounted && (
        <div
          className={cn(
            "fixed inset-0 z-[80] bg-black/60 transition-opacity duration-300",
            visible ? "opacity-100" : "opacity-0",
          )}
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}

      {mounted && (
        <aside
          className={cn(
            "fixed top-0 left-0 bottom-0 z-[90] w-[280px] sm:w-[300px] bg-[#0f2319] text-white shadow-2xl transition-transform duration-300 ease-out flex flex-col",
            visible ? "translate-x-0" : "-translate-x-full",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/30"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                  <path d="M12 2 L20 10 L12 18 L4 10 Z" opacity="0.9" />
                  <path d="M12 6 L16 10 L12 14 L8 10 Z" opacity="0.7" />
                  <path d="M12 10 L13.5 11.5 L12 13 L10.5 11.5 Z" />
                </svg>
              </div>
              <div className="leading-none">
                <p className="text-sm font-bold tracking-tight">Al-Quran</p>
                <p className="text-[10px] text-emerald-200/70 font-medium">Digital Indonesia</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeSwitcher />
              <button
                onClick={() => onOpenChange(false)}
                className="icon-btn h-9 w-9 text-white hover:bg-white/10"
                aria-label="Tutup menu"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="h-px bg-white/10 mx-3" />

          <nav className="flex-1 overflow-y-auto py-2 px-2" aria-label="Menu utama">
            {SECTIONS.map((section) => (
              <div key={section.title} className="mb-1">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60">
                  {section.title}
                </p>
                <ul className="space-y-0.5" role="list">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] font-medium transition-all",
                              isActive
                                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                                : "text-emerald-50/90 hover:bg-white/5",
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon
                                className={cn(
                                  "w-[18px] h-[18px] shrink-0",
                                  isActive ? "text-white" : "text-emerald-300",
                                )}
                                aria-hidden="true"
                              />
                              <span className="truncate">{item.label}</span>
                              {isActive && <span className="sr-only"> (halaman aktif)</span>}
                            </>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {/* === Section "Akses Cepat" — PWA Install (3 variants) === */}
            <div className="mt-3 mb-1">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60">
                Akses Cepat
              </p>
              <ul className="space-y-0.5" role="list">
                {/* Variant 1: Install prompt tersedia (Android/Desktop Chrome) */}
                {isInstallable && !isInstalled && (
                  <li>
                    <button
                      type="button"
                      onClick={handleInstall}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] font-medium transition-all text-emerald-50/90 hover:bg-white/5 group"
                      aria-label="Install aplikasi ke home screen"
                    >
                      <div
                        className="w-[18px] h-[18px] shrink-0 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
                        aria-hidden="true"
                      >
                        <Download className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="truncate flex-1 text-left">Install Aplikasi</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                        Baru
                      </span>
                    </button>
                  </li>
                )}

                {/* Variant 2: Sudah ter-install (display only, no action) */}
                {isInstalled && (
                  <li>
                    <div
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] font-medium text-emerald-200/60"
                      role="status"
                      aria-label="Aplikasi sudah ter-install"
                    >
                      <div
                        className="w-[18px] h-[18px] shrink-0 rounded-md bg-emerald-500/20 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                      </div>
                      <span className="truncate flex-1 text-left">App Terinstall</span>
                    </div>
                  </li>
                )}

                {/* Variant 3: iOS Safari (no beforeinstallprompt support) —
                 * kasih instruksi manual install via Share menu.
                 *
                 * Tampil hanya kalau:
                 * - Device adalah iOS/iPadOS
                 * - App BELUM ter-install (kalau sudah, tampil variant 2 di atas)
                 * - Tidak ada install prompt (kalau ada, tampil variant 1)
                 */}
                {!isInstalled && !isInstallable && isIOSDevice() && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setShowIOSInstructions(true)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] font-medium transition-all text-emerald-50/90 hover:bg-white/5 group"
                      aria-label="Cara install di iOS"
                      aria-expanded={showIOSInstructions}
                    >
                      <div
                        className="w-[18px] h-[18px] shrink-0 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
                        aria-hidden="true"
                      >
                        <Download className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="truncate flex-1 text-left">Install di iPhone</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                        Tap
                      </span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* iOS Install Instructions Modal — inline expandable.
             * Ditampilkan di bawah drawer nav sebagai overlay supaya
             * user lihat step-by-step tanpa kehilangan konteks menu.
             * Tapi kita pakai simple expandable di dalam drawer saja
             * untuk UX yang lebih clean. */}
            {showIOSInstructions && (
              <div className="mx-2 my-2 p-3 rounded-xl bg-emerald-900/50 border border-emerald-500/30 backdrop-blur-sm animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                    📱 Cara Install di iOS
                  </p>
                  <button
                    onClick={() => setShowIOSInstructions(false)}
                    className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-emerald-200"
                    aria-label="Tutup instruksi"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
                <ol className="space-y-1.5 text-[11px] text-emerald-50/90">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-200 flex items-center justify-center text-[9px] font-bold mt-0.5">
                      1
                    </span>
                    <span>
                      Tap tombol <Share className="inline w-3 h-3 text-emerald-300" />{" "}
                      <strong>Share</strong> di bar browser
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-200 flex items-center justify-center text-[9px] font-bold mt-0.5">
                      2
                    </span>
                    <span>
                      Scroll ke bawah, pilih{" "}
                      <strong>
                        <Plus className="inline w-3 h-3 text-emerald-300" /> Add to Home Screen
                      </strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-200 flex items-center justify-center text-[9px] font-bold mt-0.5">
                      3
                    </span>
                    <span>
                      Tap <strong>Add</strong> di pojok kanan atas
                    </span>
                  </li>
                </ol>
                <p className="text-[10px] text-emerald-200/70 italic mt-2 leading-relaxed">
                  Setelah ter-install, app akan muncul di home screen seperti aplikasi native dan dapat digunakan offline.
                </p>
              </div>
            )}
          </nav>
        </aside>
      )}

      {open && showScrollTop && (
        <button
          onClick={handleScrollTop}
          className="fixed bottom-24 right-4 z-[95] w-11 h-11 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Scroll ke atas"
        >
          <ArrowUp className="w-5 h-5 text-foreground" />
        </button>
      )}
    </>
  );
}