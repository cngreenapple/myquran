import type { Surah, SurahDetail } from "@/types/quran";

const BASE_URL = "https://equran.id/api/v2";
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

// Audio murottal dari beberapa CDN dengan fallback otomatis
const AUDIO_CDNS = [
  // Primary - AlQuran Cloud CDN
  (n: number) => `https://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/${n}/full`,
  // Fallback 1 - equran.id
  (n: number) => `https://equran.id/media/audio/full/ar.alafasy/${n}.mp3`,
  // Fallback 2 - Islamic Network
  (n: number) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`,
];

// Backward compatible - returns primary URL
export function getAudioUrl(nomor: number): string {
  return AUDIO_CDNS[0](nomor);
}

// Returns all fallback URLs for audio element
export function getAudioSources(nomor: number): { src: string; type: string }[] {
  return [
    { src: `https://equran.id/media/audio/full/ar.alafasy/${nomor}.mp3`, type: "audio/mpeg" },
    { src: `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${nomor}.mp3`, type: "audio/mpeg" },
  ];
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}