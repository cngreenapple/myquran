import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { PrayerCard } from "@/components/PrayerCard";
import type { PrayerTime } from "@/lib/prayer-times";

const basePrayer: PrayerTime = {
  name: "Subuh",
  nameArabic: "الفجر",
  time: "04:30",
  timestamp: Date.now() + 3600000,
  isPast: false,
  isNext: false,
};

describe("PrayerCard", () => {
  it("renders prayer name, Arabic, and time", () => {
    render(<PrayerCard prayer={basePrayer} />);
    expect(screen.getByText("Subuh")).toBeInTheDocument();
    expect(screen.getByText("الفجر")).toBeInTheDocument();
    expect(screen.getByText("04:30")).toBeInTheDocument();
  });

  it("shows past indicator (check icon) when isPast=true", () => {
    const pastPrayer = { ...basePrayer, isPast: true };
    render(<PrayerCard prayer={pastPrayer} />);

    // Past prayer should have check icon
    const card = screen.getByText("Subuh").closest('[class*="rounded-2xl"]');
    expect(card?.className).toMatch(/opacity-60/);
  });

  it("shows bell indicator when isNext=true", () => {
    const nextPrayer = { ...basePrayer, isNext: true };
    render(<PrayerCard prayer={nextPrayer} isNext={true} />);

    // Next prayer should have emerald highlight
    const card = screen.getByText("Subuh").closest('[class*="rounded-2xl"]');
    expect(card?.className).toMatch(/emerald/);
  });

  it("shows 'Aktifkan alarm' button when isNext=true and onNotify provided", () => {
    const nextPrayer = { ...basePrayer, isNext: true };
    const onNotify = vi.fn();
    render(
      <PrayerCard prayer={nextPrayer} isNext={true} onNotify={onNotify} />,
    );

    const alarmButton = screen.getByText(/Aktifkan alarm/);
    expect(alarmButton).toBeInTheDocument();
  });

  it("calls onNotify when alarm button clicked", () => {
    const nextPrayer = { ...basePrayer, isNext: true };
    const onNotify = vi.fn();
    render(
      <PrayerCard prayer={nextPrayer} isNext={true} onNotify={onNotify} />,
    );

    const alarmButton = screen.getByText(/Aktifkan alarm/);
    fireEvent.click(alarmButton);
    expect(onNotify).toHaveBeenCalledTimes(1);
  });

  it("does not show alarm button when isNext=false", () => {
    render(<PrayerCard prayer={basePrayer} isNext={false} />);
    expect(screen.queryByText(/Aktifkan alarm/)).not.toBeInTheDocument();
  });

  it("renders different prayer times correctly", () => {
    const dzuhurPrayer = {
      ...basePrayer,
      name: "Dzuhur",
      nameArabic: "الظهر",
      time: "12:00",
    };
    render(<PrayerCard prayer={dzuhurPrayer} />);
    expect(screen.getByText("Dzuhur")).toBeInTheDocument();
    expect(screen.getByText("الظهر")).toBeInTheDocument();
    expect(screen.getByText("12:00")).toBeInTheDocument();
  });
});