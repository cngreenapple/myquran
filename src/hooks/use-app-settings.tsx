import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppSettings } from "@/types/stats";

const SETTINGS_KEY = "quran-app-settings";

const DEFAULT_SETTINGS: AppSettings = {
  themeAccent: "emerald",
  arabicFontSize: "lg",
  translationFontSize: "sm",
  arabicFont: "amiri",
  showVerseOfTheDay: true,
  showTransliteration: true,
  autoPlayAudio: false,
};

interface AppSettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error("[Settings] Failed to save", err);
    }
  }, [settings]);

  // Apply theme accent to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.accent = settings.themeAccent;
  }, [settings.themeAccent]);

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo<AppSettingsContextValue>(
    () => ({ settings, updateSetting, resetSettings }),
    [settings, updateSetting, resetSettings],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}

export const ACCENT_COLORS = {
  emerald: { name: "Hijau Zamrud", value: "160 84% 25%", class: "emerald" },
  blue: { name: "Biru Langit", value: "210 90% 35%", class: "blue" },
  purple: { name: "Ungu", value: "265 70% 40%", class: "purple" },
  amber: { name: "Emas", value: "38 92% 45%", class: "amber" },
  rose: { name: "Merah Rose", value: "340 75% 45%", class: "rose" },
} as const;