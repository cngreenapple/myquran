export interface ReadingStats {
  totalAyatRead: number; // Total ayat yang pernah dibuka
  surahsOpened: number[]; // Array of surah numbers yang pernah dibuka
  lastReadAt: number; // timestamp
  streakDays: number; // hari berturut membaca
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
}

export interface ReadingHistoryItem {
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  timestamp: number;
  type: "viewed" | "bookmarked" | "completed";
}

export interface AppSettings {
  themeAccent: "emerald" | "blue" | "purple" | "amber" | "rose";
  arabicFontSize: "sm" | "base" | "lg" | "xl" | "2xl";
  translationFontSize: "sm" | "base" | "lg";
  arabicFont: "amiri" | "scheherazade" | "traditional";
  showVerseOfTheDay: boolean;
  showTransliteration: boolean;
  autoPlayAudio: boolean;
}

export type ShareTheme = "emerald" | "sky" | "violet" | "amber" | "rose";