import { Link, NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  Home,
  Settings as SettingsIcon,
  Clock,
  BookHeart,
  Hand,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";

const navItems = [
  { to: "/", label: "Beranda", icon: Home, ariaLabel: "Halaman utama" },
  { to: "/jadwal-sholat", label: "Sholat", icon: Clock, ariaLabel: "Jadwal sholat" },
  { to: "/dzikir", label: "Dzikir", icon: BookHeart, ariaLabel: "Dzikir pagi dan petang" },
  { to: "/doa", label: "Doa", icon: Hand, ariaLabel: "Kumpulan doa" },
  { to: "/kalender", label: "Kalender", icon: Calendar, ariaLabel: "Kalender Hijriah" },
  { to: "/settings", label: "Setting", icon: SettingsIcon, ariaLabel: "Pengaturan aplikasi" },
];

export function Header() {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border bg-background"
      role="banner"
    >
      <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-3 max-w-5xl">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group shrink-0"
          aria-label="Al-Quran Digital Indonesia - Halaman utama"
        >
          <div className="relative">
            <div
              className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"
              aria-hidden="true"
            />
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden="true" />
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

        {/* Mobile: Icon-only nav (compact horizontal scroll) */}
        <nav
          className="flex md:hidden items-center gap-0.5 overflow-x-auto no-scrollbar flex-1 justify-end"
          aria-label="Menu navigasi utama"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )
                }
                aria-label={item.ariaLabel}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {isActive && <span className="sr-only"> (halaman aktif)</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop: Full nav with labels */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Menu navigasi utama"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )
                }
                aria-label={item.ariaLabel}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {item.label}
                    {isActive && <span className="sr-only"> (halaman aktif)</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Theme switcher */}
        <ThemeSwitcher />
      </div>
    </header>
  );
}

// BottomNav tetap di-export untuk backward compatibility tapi tidak dipakai
export function BottomNav() {
  const location = useLocation();
  return null;
}