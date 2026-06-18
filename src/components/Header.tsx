import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { BookOpen, Menu } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface HeaderProps {
  onMenuClick: () => void;
}

/**
 * Header dirender via Portal ke document.body.
 *
 * Mengapa perlu Portal?
 * - shadcn Toaster merender <ToastViewport> di body level dengan
 *   `position: fixed; top: 0; z-100; padding 16px` → occupy ~64px di top.
 * - Sonner merender section dengan z-index ~999999 di top.
 * - Tanpa Portal, Header ada di dalam scroll container page, sehingga
 *   ditimpa oleh viewport Toaster/Sonner walaupun z-index lebih tinggi.
 *   (Ini terjadi karena stacking context hanya bekerja pada parent yang sama.)
 *
 * Dengan Portal:
 * - Header jadi last child of document.body (setelah Toaster/Sonner).
 * - DOM order + z-index [1000] → Header PASTI di atas semua overlay.
 * - CSS pointer-events: none di ToastViewport/Sonner (di globals.css)
 *   sebagai backup defense.
 */
export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();

  const content = (
    <header
      className="sticky top-0 z-[1000] w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="banner"
    >
      <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-3 max-w-5xl">
        <button
          onClick={onMenuClick}
          className="relative z-[1010] w-10 h-10 rounded-xl hover:bg-muted active:bg-muted/80 flex items-center justify-center transition-colors"
          aria-label="Buka menu navigasi"
          type="button"
        >
          <Menu className="w-5 h-5 text-foreground" aria-hidden="true" />
        </button>

        {/* Logo */}
        <Link
          to="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="flex items-center gap-2 group shrink-0"
          aria-label="Al-Quran Digital Indonesia - Halaman utama"
        >
          <div className="relative">
            <div
              className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"
              aria-hidden="true"
            />
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <BookOpen
                className="w-4 h-4 text-white"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm text-foreground leading-tight">
              Al-Quran
            </h1>
            <p className="text-[9px] text-muted-foreground leading-tight font-medium">
              Digital
            </p>
          </div>
        </Link>

        {/* Right: theme */}
        <ThemeSwitcher />
      </div>
    </header>
  );

  // Render ke document.body supaya Header jadi last child di DOM,
  // sehingga menang stacking order dari Toaster/Sonner viewport.
  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
}