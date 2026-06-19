import { useQuery } from "@tanstack/react-query";
import { fetchTafsirSurah, type TafsirItem } from "@/lib/api";

/**
 * Hook untuk fetch tafsir Kemenag per surah.
 *
 * API equran.id v2 return tafsir di endpoint TERPISAH
 * (bukan di /surat/{nomor}). Tafsir Kemenag ada di:
 *   GET https://equran.id/api/v2/tafsir/{nomor}
 *
 * Stale time 24 jam — tafsir static, jarang berubah.
 * Return Map<ayatNumber, tafsirText> untuk lookup O(1).
 */
export function useTafsirSurah(nomor: number) {
  const query = useQuery({
    queryKey: ["tafsir", nomor],
    queryFn: () => fetchTafsirSurah(nomor),
    enabled: !!nomor && nomor >= 1 && nomor <= 114,
    staleTime: 1000 * 60 * 60 * 24, // 24 jam
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  /** Map ayatNumber → tafsir text untuk lookup O(1) di VerseCard. */
  const tafsirMap: Map<number, string> = new Map();
  if (query.data) {
    for (const item of query.data as TafsirItem[]) {
      tafsirMap.set(item.ayat, item.teks);
    }
  }

  return {
    tafsirMap,
    isLoading: query.isLoading,
    isError: query.isError,
    /** Ambil tafsir untuk ayat tertentu. Return null kalau tidak ada. */
    getTafsir: (ayatNumber: number) => tafsirMap.get(ayatNumber) ?? null,
    refetch: () => query.refetch(),
  };
}