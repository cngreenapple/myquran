export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull?: Record<string, string>;
}

/**
 * Info surah tetangga untuk navigasi.
 * `false` kalau tidak ada (Mis: surah 1 tidak punya suratSebelumnya).
 */
export interface SurahNeighbor {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio?: Record<string, string>;
}

export interface SurahDetail extends Surah {
  ayat: Ayat[];
  audioFull: Record<string, string>;
  /** Tetangga untuk navigasi prev/next. `false` jika tidak ada. */
  suratSelanjutnya: SurahNeighbor | false;
  suratSebelumnya: SurahNeighbor | false;
}

export interface LastRead {
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  timestamp: number;
}

export interface BookmarkItem {
  id: string;
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  note?: string;
  previewText?: string;
  timestamp: number;
}

/**
 * Shared color variant type — digunakan di seluruh app untuk
 * dzikir, doa, asmaul husna, holiday, puasa sunnah, dll.
 */
export type ColorVariant = "emerald" | "amber" | "sky" | "rose" | "violet";