import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import { DzikirCounterCard } from "@/components/DzikirCounterCard";
import type { DzikirItem } from "@/types/dzikir";

const mockItem: DzikirItem = {
  id: "test-1",
  arabic: "سُبْحَانَ اللَّهِ",
  latin: "Subḥānallāh",
  translation: "Maha Suci Allah",
  count: 3,
  fawaid: "Keutamaan dzikir ini sangat besar.",
  source: "HR. Bukhari",
};

describe("DzikirCounterCard", () => {
  it("renders Arabic, Latin, translation, and target", () => {
    render(
      <DzikirCounterCard
        categoryId="pagi"
        item={mockItem}
        color="emerald"
      />,
    );

    expect(screen.getByText(/سُبْحَانَ اللَّهِ/)).toBeInTheDocument();
    expect(screen.getByText(/Subḥānallāh/)).toBeInTheDocument();
    expect(screen.getByText(/Maha Suci Allah/)).toBeInTheDocument();
    expect(screen.getByText(/Target: 3x/)).toBeInTheDocument();
  });

  it("shows fawaid (benefits) when provided", () => {
    render(
      <DzikirCounterCard
        categoryId="pagi"
        item={mockItem}
        color="emerald"
      />,
    );

    expect(screen.getByText(/Keutamaan dzikir ini/)).toBeInTheDocument();
  });

  it("shows source when provided", () => {
    render(
      <DzikirCounterCard
        categoryId="pagi"
        item={mockItem}
        color="emerald"
      />,
    );

    expect(screen.getByText(/HR. Bukhari/)).toBeInTheDocument();
  });

  it("increments counter on tap", async () => {
    render(
      <DzikirCounterCard
        categoryId="pagi"
        item={mockItem}
        color="emerald"
      />,
    );

    // Initial state: Sisa 3x
    expect(screen.getByText(/Sisa 3x/)).toBeInTheDocument();

    // Tap the big button
    const tapButton = screen.getByRole("button", {
      name: /Tap untuk Dzikir \(0\/3\)/,
    });
    fireEvent.click(tapButton);

    await waitFor(() => {
      expect(screen.getByText(/Sisa 2x/)).toBeInTheDocument();
    });
  });

  it("marks as completed when target reached", async () => {
    render(
      <DzikirCounterCard
        categoryId="pagi"
        item={mockItem}
        color="emerald"
      />,
    );

    // Tap 3 times
    const tapButton = screen.getByRole("button", {
      name: /Tap untuk Dzikir \(0\/3\)/,
    });
    fireEvent.click(tapButton);
    fireEvent.click(tapButton);
    fireEvent.click(tapButton);

    await waitFor(() => {
      expect(screen.getByText(/Selesai/)).toBeInTheDocument();
    });
  });

  it("shows reset button after first increment", async () => {
    render(
      <DzikirCounterCard
        categoryId="pagi"
        item={mockItem}
        color="emerald"
      />,
    );

    // Initially no reset button
    expect(screen.queryByRole("button", { name: /Reset/ })).not.toBeInTheDocument();

    // Tap once
    const tapButton = screen.getByRole("button", {
      name: /Tap untuk Dzikir \(0\/3\)/,
    });
    fireEvent.click(tapButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Reset/ })).toBeInTheDocument();
    });
  });

  it("resets counter when reset button clicked", async () => {
    render(
      <DzikirCounterCard
        categoryId="pagi"
        item={mockItem}
        color="emerald"
      />,
    );

    // Tap twice
    const tapButton = screen.getByRole("button", {
      name: /Tap untuk Dzikir \(0\/3\)/,
    });
    fireEvent.click(tapButton);
    fireEvent.click(tapButton);

    await waitFor(() => {
      expect(screen.getByText(/Sisa 1x/)).toBeInTheDocument();
    });

    // Reset
    const resetButton = screen.getByRole("button", { name: /Reset/ });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/Sisa 3x/)).toBeInTheDocument();
    });
  });

  it("does not increment when already completed", async () => {
    render(
      <DzikirCounterCard
        categoryId="pagi"
        item={mockItem}
        color="emerald"
      />,
    );

    // Complete the counter
    const tapButton = screen.getByRole("button", {
      name: /Tap untuk Dzikir \(0\/3\)/,
    });
    fireEvent.click(tapButton);
    fireEvent.click(tapButton);
    fireEvent.click(tapButton);

    await waitFor(() => {
      expect(screen.getByText(/Selesai/)).toBeInTheDocument();
    });

    // Try to click the header again (should not change anything)
    const header = screen.getByText(/Selesai/).closest("div");
    if (header) fireEvent.click(header);

    // Still "Selesai" not "Sisa 2x"
    expect(screen.getByText(/Selesai/)).toBeInTheDocument();
  });
});