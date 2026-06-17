import { useQuery } from "@tanstack/react-query";
import { fetchSurahDetail } from "@/lib/api";

export function useSurahDetail(nomor: number) {
  return useQuery({
    queryKey: ["surah", nomor],
    queryFn: () => fetchSurahDetail(nomor),
    enabled: !!nomor && nomor >= 1 && nomor <= 114,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}