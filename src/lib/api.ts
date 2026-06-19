import type { Surah, SurahDetail } from "@/types/quran";

const BASE_URL = "https://equran.id/api/v2";
const TAFSIR_URL = "https://equran.id/api/v2/tafsir";
const TIMEOUT = 20000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchSurahList(): Promise<Surah[]> {
  const response = await fetchWithTimeout(`${BASE_URL}/surat`);
  const data = await response.json();
  return data.data;
}

export async function fetchSurahDetail(nomor: number): Promise<SurahDetail> {
  const response = await fetchWithTimeout(`${BASE_URL}/surat/${nomor}`);
  const data = await response.json();
  return data.data;
}

/**
 * Tafsir Kemenag per surah.
 * Endpoint: GET https://equran.id/api/v2/tafsir/{nomor}
 *
 * Response shape:
 * {
 *   code: 200,
 *   data: {
 *     nomor: 1,
 *     nama: "Al-Fatihah",
 *     tafsir: [
 *       { ayat: 1, teks: "..." },
 *       { ayat: 2, teks: "..." }
 *     ]
 *   }
 * }
 */
export interface TafsirItem {
  ayat: number;
  teks: string;
}

export interface TafsirSurahResponse {
  nomor: number;
  nama: string;
  tafsir: TafsirItem[];
}

export async function fetchTafsirSurah(nomor: number): Promise<TafsirItem[]> {
  const response = await fetchWithTimeout(`${TAFSIR_URL}/${nomor}`);
  const data = await response.json();
  return data.data?.tafsir ?? [];
}