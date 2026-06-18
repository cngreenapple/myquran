/**
 * Hari-hari besar Islam (Hari Libur & Hari Besar Islam)
 *
 * Sumber referensi:
 * - Keputusan Menteri Agama (KMA) No. 6 Tahun 2016 tentang
 *   Penetapan Hari Libur Nasional dan Cuti Bersama
 * - Penetapan MUI tentang Hari Besar Islam
 *
 * Catatan: Tanggal "bulan" dan "hari" di sini berbasis kalender Hijriah
 * (1-12 untuk bulan, 1-30 untuk hari). Penentuan tanggal pasti bergantung
 * pada rukyatul hilal (observasi bulan sabit) sehingga dapat bergeser ±1-2 hari.
 *
 * Tipe:
 * - "libur": Hari libur nasional (PHBI - Pemerintah)
 * - "besar": Hari besar Islam (PHBI - Muhammadiyah/umat)
 * - "minggu": Peristiwa bersejarah lain (bukan libur, tapi penting)
 */

export type HolidayType = "libur" | "besar" | "minggu";

export interface IslamicHoliday {
  id: string;
  name: string; // Nama Indonesia
  nameArabic: string; // Nama Arab
  hijriMonth: number; // 1-12 (bulan Hijriah)
  hijriDay: number; // 1-30 (hari dalam bulan Hijriah)
  type: HolidayType;
  emoji: string;
  description: string;
  // Warna opsional untuk badge
  color: "emerald" | "amber" | "rose" | "sky" | "violet";
}

export const ISLAMIC_HOLIDAYS: IslamicHoliday[] = [
  // Libur Nasional
  {
    id: "tahun-baru-islam",
    name: "Tahun Baru Islam",
    nameArabic: "رأس السنة الهجرية",
    hijriMonth: 1,
    hijriDay: 1,
    type: "libur",
    emoji: "🌙",
    description:
      "Mengingati peristiwa hijrah Nabi Muhammad ﷺ dari Mekah ke Madinah pada tahun 622 Masehi. Awal tahun baru kalender Hijriah.",
    color: "emerald",
  },
  {
    id: "maulid-nabi",
    name: "Maulid Nabi Muhammad ﷺ",
    nameArabic: "المولد النبوي",
    hijriMonth: 3,
    hijriDay: 12,
    type: "libur",
    emoji: "🕌",
    description:
      "Peringatan hari lahir Nabi Muhammad ﷺ pada 12 Rabi'ul Awal. Diciptakan di era kekuasaan Daulah Fathimiyyah di Kairo (abad ke-4 H).",
    color: "emerald",
  },
  {
    id: "isra-miraj",
    name: "Isra' dan Mi'raj",
    nameArabic: "الإسراء والمعراج",
    hijriMonth: 7,
    hijriDay: 27,
    type: "libur",
    emoji: "✨",
    description:
      "Peristiwa perjalanan Nabi Muhammad ﷺ dari Masjidil Haram ke Masjidil Aqsha (Isra') lalu naik ke langit ketujuh (Mi'raj) menerima perintah shalat lima waktu.",
    color: "violet",
  },
  {
    id: "idul-fitri",
    name: "Hari Raya Idul Fitri",
    nameArabic: "عيد الفطر",
    hijriMonth: 10,
    hijriDay: 1,
    type: "libur",
    emoji: "🌙",
    description:
      "Hari raya umat Islam setelah sebulan berpuasa di bulan Ramadan. Dianjurkan takbir, tahmid, tahlil, dan saling bermaaf-maafan.",
    color: "emerald",
  },
  {
    id: "idul-adha",
    name: "Hari Raya Idul Adha",
    nameArabic: "عيد الأضحى",
    hijriMonth: 12,
    hijriDay: 10,
    type: "libur",
    emoji: "🕋",
    description:
      "Hari raya haji. Mengingati kesabaran Nabi Ibrahim a.s. yang bersedia mengorbankan putranya Ismail. Umat Islam yang mampu menyembelih hewan kurban.",
    color: "amber",
  },

  // Hari Besar Islam (bukan libur nasional tapi penting)
  {
    id: "ramadan-awal",
    name: "Awal Puasa Ramadan",
    nameArabic: "بداية رمضان",
    hijriMonth: 9,
    hijriDay: 1,
    type: "besar",
    emoji: "🌙",
    description:
      "Hari pertama bulan Ramadan. Umat Islam mulai berpuasa wajib sebulan penuh. Penentuan awalnya menunggu keputusan resmi Kemenag berdasarkan rukyatul hilal.",
    color: "violet",
  },
  {
    id: "nuzulul-quran",
    name: "Nuzulul Qur'an",
    nameArabic: "نزول القرآن",
    hijriMonth: 9,
    hijriDay: 17,
    type: "besar",
    emoji: "📖",
    description:
      "Hari diturunkannya Al-Qur'an. Peringatan peristiwa turunnya wahyu pertama di Gua Hira kepada Nabi Muhammad ﷺ. Dianjurkan membaca dan mengkaji Al-Qur'an.",
    color: "sky",
  },
  {
    id: "ramadan-10-last-10",
    name: "10 Hari Terakhir Ramadan",
    nameArabic: "العشر الأواخر من رمضان",
    hijriMonth: 9,
    hijriDay: 21,
    type: "besar",
    emoji: "🌟",
    description:
      "Malam Lailatul Qadar lebih utama dari 1000 bulan. Dianjurkan memperbanyak ibadah, i'tikaf, dan membaca Al-Qur'an.",
    color: "violet",
  },
  {
    id: "arafah",
    name: "Hari Arafah",
    nameArabic: "يوم عرفة",
    hijriMonth: 12,
    hijriDay: 9,
    type: "besar",
    emoji: "🕋",
    description:
      "Hari wajib bagi jemaah haji wukuf di Padang Arafah. Bagi yang tidak haji, disunnahkan berpuasa Arafah yang menghapuskan dosa dua tahun.",
    color: "amber",
  },
  {
    id: "tahun-baru-hijriah-arafah",
    name: "Hari Tasyrik",
    nameArabic: "أيام التشريق",
    hijriMonth: 12,
    hijriDay: 11,
    type: "besar",
    emoji: "🕋",
    description:
      "Hari-hari Tasyrik (11, 12, 13 Dzulhijjah). Umat Islam yang sedang haji melempar jumrah, berdzikir, dan berzikir kepada Allah.",
    color: "amber",
  },

  // Peristiwa penting lain
  {
    id: "hijrah-nabi",
    name: "Hari Hijrah Nabi",
    nameArabic: "هجرة النبي",
    hijriMonth: 1,
    hijriDay: 1,
    type: "minggu",
    emoji: "🕋",
    description:
      "Mengenang peristiwa hijrah Nabi Muhammad ﷺ dari Mekah ke Yatsrib (Madinah) pada 622 Masehi. Menjadi tonggak awal perhitungan kalender Hijriah.",
    color: "emerald",
  },
];

// Helper: cari hari besar pada bulan & hari tertentu (untuk highlight di kalender)
export function getHolidayOnDate(hijriMonth: number, hijriDay: number): IslamicHoliday | undefined {
  return ISLAMIC_HOLIDAYS.find(
    (h) => h.hijriMonth === hijriMonth && h.hijriDay === hijriDay,
  );
}

// Helper: list hari besar untuk bulan Hijriah tertentu
export function getHolidaysInMonth(hijriMonth: number): IslamicHoliday[] {
  return ISLAMIC_HOLIDAYS.filter((h) => h.hijriMonth === hijriMonth);
}

// Label tipe
export const HOLIDAY_TYPE_LABELS: Record<HolidayType, { label: string; emoji: string; description: string }> = {
  libur: { label: "Libur Nasional", emoji: "🏛️", description: "Hari libur resmi pemerintah (PHBI)" },
  besar: { label: "Hari Besar Islam", emoji: "🌙", description: "Hari penting bagi umat Islam" },
  minggu: { label: "Peristiwa Bersejarah", emoji: "📜", description: "Momen bersejarah Islam" },
};