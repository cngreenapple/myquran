import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { SurahCard } from "@/components/SurahCard";
import type { Surah } from "@/types/quran";

const mockSurah: Surah = {
  nomor: 1,
  nama: "سُورَةُ ٱلْفَاتِحَةِ",
  namaLatin: "Al-Fatihah",
  jumlahAyat: 7,
  tempatTurun: "Mekah",
  arti: "Pembukaan",
  deskripsi: "Surah pertama dalam Al-Qur'an.",
};

describe("SurahCard", () => {
  it("renders surah name, Latin, and meaning", () => {
    render(<SurahCard surah={mockSurah} />);

    expect(screen.getByText("Al-Fatihah")).toBeInTheDocument();
    expect(screen.getByText("Pembukaan")).toBeInTheDocument();
    expect(screen.getByText("7 Ayat")).toBeInTheDocument();
  });

  it("shows tempat turun badge (Mekah)", () => {
    render(<SurahCard surah={mockSurah} />);
    expect(screen.getByText("Mekah")).toBeInTheDocument();
  });

  it("shows Madinah badge for Madani surah", () => {
    const madinahSurah = { ...mockSurah, nomor: 2, tempatTurun: "Madinah" };
    render(<SurahCard surah={madinahSurah} />);
    expect(screen.getByText("Madinah")).toBeInTheDocument();
  });

  it("highlights matching text in search query", () => {
    render(<SurahCard surah={mockSurah} query="Fatihah" />);

    // Text should be wrapped in <mark> for highlighting
    const mark = screen.getByText("Fatihah");
    expect(mark.tagName).toBe("MARK");
  });

  it("does not highlight when query does not match", () => {
    render(<SurahCard surah={mockSurah} query="xyz" />);

    // Latin name should still be rendered, but not highlighted
    const latin = screen.getByText("Al-Fatihah");
    expect(latin.tagName).not.toBe("MARK");
  });

  it("renders as link to surah detail page", () => {
    render(<SurahCard surah={mockSurah} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/surat/1");
  });

  it("strips 'سُورَةُ ' prefix from Arabic name", () => {
    render(<SurahCard surah={mockSurah} />);
    // Should show ٱلْفَاتِحَةِ not سُورَةُ ٱلْفَاتِحَةِ
    expect(screen.queryByText(/سُورَةُ/)).not.toBeInTheDocument();
  });
});