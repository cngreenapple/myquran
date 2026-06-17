export type FastingCategory = "weekly" | "monthly" | "yearly" | "recommended";

export interface FastingItem {
  id: string;
  title: string;
  arabicName?: string;
  schedule: string;
  description: string;
  category: FastingCategory;
  benefit: string;
  source?: string;
  emoji: string;
  color: "emerald" | "amber" | "sky" | "rose" | "violet";
}

export const PUASA_SUNNAH: FastingItem[] = [
  {
    id: "senin-kamis",
    title: "Puasa Senin & Kamis",
    arabicName: "صيام الإثنين والخميس",
    schedule: "Setiap Senin dan Kamis",
    description:
      "Amalan yang sangat dicintai Rasulullah ﷺ. Amal kebaikan diangkat kepada Allah pada kedua hari tersebut.",
    category: "weekly",
    benefit:
      "Amal manusia diangkat pada hari Senin dan Kamis, Allah akan mengampuni dosa-dosanya.",
    source: "HR. Tirmidzi & Ibnu Majah",
    emoji: "📅",
    color: "emerald",
  },
  {
    id: "ayyamul-bidh",
    title: "Puasa Ayyamul Bidh",
    arabicName: "صيام الأيام البيض",
    schedule: "Tanggal 13, 14, 15 setiap bulan Hijriah",
    description:
      "Puasa di pertengahan bulan (tanggal putih). Dianjurkan karena pahalanya setara dengan puasa setahun penuh.",
    category: "monthly",
    benefit:
      "Barangsiapa berpuasa tiga hari setiap bulan, maka seolah-olah ia berpuasa setahun penuh.",
    source: "HR. Bukhari & Muslim",
    emoji: "🌕",
    color: "amber",
  },
  {
    id: "syawal",
    title: "Puasa 6 Hari di Bulan Syawal",
    arabicName: "صيام ست من شوال",
    schedule: "1-6 Syawal (setelah Idul Fitri)",
    description:
      "Puasa enam hari di bulan Syawal setelah Ramadan. Dianjurkan untuk menyempurnakan pahala puasa Ramadan.",
    category: "yearly",
    benefit:
      "Siapa yang berpuasa Ramadan kemudian mengiringinya dengan 6 hari Syawal, seolah-olah ia berpuasa setahun penuh.",
    source: "HR. Muslim",
    emoji: "🌙",
    color: "emerald",
  },
  {
    id: "arafah",
    title: "Puasa Arafah",
    arabicName: "صيام يوم عرفة",
    schedule: "9 Dzulhijjah",
    description:
      "Puasa pada hari Arafah bagi yang tidak menunaikan haji. Menghapuskan dosa setahun yang lalu dan setahun yang akan datang.",
    category: "yearly",
    benefit:
      "Puasa Arafah menghapuskan dosa dua tahun: setahun yang lalu dan setahun yang akan datang.",
    source: "HR. Muslim",
    emoji: "🕋",
    color: "amber",
  },
  {
    id: "asyura",
    title: "Puasa Asyura",
    arabicName: "صيام يوم عاشوراء",
    schedule: "10 Muharram",
    description:
      "Puasa pada tanggal 10 Muharram. Dianjurkan berpuasa juga pada tanggal 9 (Tasu'a) untuk menyelisihi Ahli Kitab.",
    category: "yearly",
    benefit:
      "Menghapuskan dosa setahun yang lalu. Dianjurkan ditambah dengan puasa Tasu'a (9 Muharram).",
    source: "HR. Bukhari & Muslim",
    emoji: "🤲",
    color: "emerald",
  },
  {
    id: "tasua",
    title: "Puasa Tasu'a",
    arabicName: "صيام التاسع من محرم",
    schedule: "9 Muharram",
    description:
      "Puasa sehari sebelum Asyura. Dianjurkan bersamaan dengan puasa Asyura untuk menyelisihi Ahli Kitab.",
    category: "yearly",
    benefit:
      "Melengkapi keutamaan puasa Asyura dan mengikuti sunnah Nabi ﷺ.",
    source: "HR. Bukhari & Muslim",
    emoji: "🌟",
    color: "sky",
  },
  {
    id: "dzulhijjah-awal",
    title: "Puasa 9 Hari Pertama Dzulhijjah",
    arabicName: "صيام أول ذي الحجة",
    schedule: "1-9 Dzulhijjah",
    description:
      "Puasa di awal Dzulhijjah. Hari-hari terbaik untuk beramal saleh, terutama 9 hari pertama bulan ini.",
    category: "yearly",
    benefit:
      "Tidak ada hari yang lebih Allah cintai untuk beribadah daripada 10 hari pertama Dzulhijjah.",
    source: "HR. Bukhari",
    emoji: "✨",
    color: "violet",
  },
  {
    id: "muharram",
    title: "Puasa Bulan Muharram",
    arabicName: "صيام شهر محرم",
    schedule: "Bulan Muharram (terutama 10 Muharram)",
    description:
      "Bulan Muharram adalah salah satu dari 4 bulan haram. Puasa di bulan ini sangat dianjurkan, terutama Asyura.",
    category: "yearly",
    benefit:
      "Puasa di bulan Muharram adalah puasa yang paling utama setelah Ramadan.",
    source: "HR. Muslim",
    emoji: "🗓️",
    color: "rose",
  },
  {
    id: "sya-ban",
    title: "Puasa Bulan Sya'ban",
    arabicName: "صيام شعبان",
    schedule: "Bulan Sya'ban",
    description:
      "Nabi ﷺ banyak berpuasa di bulan Sya'ban. Sya'ban adalah bulan antara Rajab dan Ramadan.",
    category: "monthly",
    benefit:
      "Nabi ﷺ adalah orang yang paling banyak puasanya di bulan Sya'ban.",
    source: "HR. Bukhari & Muslim",
    emoji: "🌙",
    color: "sky",
  },
  {
    id: "dzulhijjah-fast",
    title: "Puasa Tasu'a dan Asyura",
    arabicName: "صيام التاسع والعاشر من محرم",
    schedule: "9 & 10 Muharram",
    description:
      "Berpuasa pada tanggal 9 dan 10 Muharram. Ini adalah cara terbaik mengamati puasa Asyura.",
    category: "recommended",
    benefit:
      "Melipatgandakan pahala Asyura dan menyelisihi Ahli Kitab.",
    source: "HR. Bukhari & Muslim",
    emoji: "🌗",
    color: "amber",
  },
];

export const CATEGORY_INFO: Record<
  FastingCategory,
  { name: string; description: string; emoji: string }
> = {
  weekly: {
    name: "Mingguan",
    description: "Puasa yang dilakukan setiap minggu",
    emoji: "📅",
  },
  monthly: {
    name: "Bulanan",
    description: "Puasa setiap bulan",
    emoji: "🌕",
  },
  yearly: {
    name: "Tahunan",
    description: "Puasa pada waktu-waktu khusus",
    emoji: "🗓️",
  },
  recommended: {
    name: "Dianjurkan",
    description: "Puasa tambahan yang sangat disarankan",
    emoji: "✨",
  },
};