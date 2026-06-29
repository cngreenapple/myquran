import { useState, useCallback } from "react";
import { QARI_LIST, type QariInfo } from "@/lib/api";

const STORAGE_KEY = "quran-selected-qari";
const DEFAULT_QARI_ID = "05"; // Al-Afasy

function getStoredQariId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_QARI_ID;
  } catch {
    return DEFAULT_QARI_ID;
  }
}

interface UseQariReturn {
  /** ID qari aktif (e.g. "05") */
  qariId: string;
  /** Info lengkap qari aktif */
  qari: QariInfo;
  /** Set qari baru (akan persist ke localStorage) */
  setQariId: (id: string) => void;
  /** Semua qari yang tersedia */
  qariList: QariInfo[];
}

/**
 * Hook untuk qari (reciter) selection.
 * Persist preference ke localStorage.
 */
export function useQari(): UseQariReturn {
  const [qariId, setQariIdState] = useState<string>(getStoredQariId);

  const setQariId = useCallback((id: string) => {
    setQariIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (err) {
      console.error("[Qari] Failed to save preference", err);
    }
  }, []);

  const qari = QARI_LIST.find((q) => q.id === qariId) ?? QARI_LIST[0];

  return { qariId, qari, setQariId, qariList: QARI_LIST };
}