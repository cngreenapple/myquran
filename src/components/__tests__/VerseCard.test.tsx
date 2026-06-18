import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { VerseCard } from "@/components/VerseCard";
import type { Ayat } from "@/types/quran";

const mockAyat: Ayat = {
  nomorAyat: 1,
  teksArab: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  teksLatin: "Bismillāhir-raḥmānir-raḥīm",
  teksIndonesia: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
  tafsir: {
    kemenag: {
      teks: "Tafsir dari Kemenag untuk ayat ini.",
    },
  },
};

// Mock navigator.share + clipboard
const mockShare = vi.fn();
const mockClipboardWrite = vi.fn();

beforeAll(() => {
  Object.defineProperty(navigator, "share", {
    writable: true,
    value: mockShare,
  });
  Object.defineProperty(navigator, "clipboard", {
    writable: true,
    value: { writeText: mockClipboardWrite },
  });
});

describe("VerseCard", () => {
  it("renders Arabic, Latin, and translation", () => {
    render(
      <VerseCard
        surahNumber={1}
        surahName="Al-Fatihah"
        ayat={mockAyat}
        showTafsir={false}
      />,
    );

    expect(
      screen.getByText(/بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Bismillāhir-raḥmānir-raḥīm/)).toBeInTheDocument();
    expect(
      screen.getByText(/Dengan nama Allah Yang Maha Pengasih/),
    ).toBeInTheDocument();
  });

  it("shows tafsir when showTafsir=true", () => {
    render(
      <VerseCard
        surahNumber={1}
        surahName="Al-Fatihah"
        ayat={mockAyat}
        showTafsir={true}
      />,
    );

    expect(screen.getByText(/Tafsir Kemenag/)).toBeInTheDocument();
    expect(screen.getByText(/Tafsir dari Kemenag/)).toBeInTheDocument();
  });

  it("hides tafsir when showTafsir=false", () => {
    render(
      <VerseCard
        surahNumber={1}
        surahName="Al-Fatihah"
        ayat={mockAyat}
        showTafsir={false}
      />,
    );

    expect(screen.queryByText(/Tafsir Kemenag/)).not.toBeInTheDocument();
  });

  it("toggles bookmark on click", async () => {
    const user = userEvent.setup();
    render(
      <VerseCard
        surahNumber={1}
        surahName="Al-Fatihah"
        ayat={mockAyat}
        showTafsir={false}
      />,
    );

    const bookmarkBtn = screen.getByRole("button", { name: /Tambah bookmark/ });
    await user.click(bookmarkBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Hapus bookmark/ }),
      ).toBeInTheDocument();
    });
  });

  it("hides transliteration when showTransliteration=false", () => {
    render(
      <VerseCard
        surahNumber={1}
        surahName="Al-Fatihah"
        ayat={mockAyat}
        showTafsir={false}
        showTransliteration={false}
      />,
    );

    expect(
      screen.queryByText(/Bismillāhir-raḥmānir-raḥīm/),
    ).not.toBeInTheDocument();
  });

  it("applies highlight style when highlighted=true", () => {
    const { container } = render(
      <VerseCard
        surahNumber={1}
        surahName="Al-Fatihah"
        ayat={mockAyat}
        showTafsir={false}
        highlighted={true}
      />,
    );

    const card = container.querySelector('[id="ayat-1"]');
    expect(card?.className).toMatch(/ring-2/);
  });

  it("opens notes dialog when notes button clicked", async () => {
    const user = userEvent.setup();
    render(
      <VerseCard
        surahNumber={1}
        surahName="Al-Fatihah"
        ayat={mockAyat}
        showTafsir={false}
      />,
    );

    const notesBtn = screen.getByRole("button", { name: /Catatan untuk ayat 1/ });
    await user.click(notesBtn);

    await waitFor(() => {
      expect(screen.getByText(/Catatan Ayat/)).toBeInTheDocument();
    });
  });

  it("has accessible button labels", () => {
    render(
      <VerseCard
        surahNumber={1}
        surahName="Al-Fatihah"
        ayat={mockAyat}
        showTafsir={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Bagikan ayat/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Catatan untuk ayat 1/ }),
    ).toBeInTheDocument();
  });
});