# Al-Qur'an Digital Indonesia

Aplikasi Al-Qur'an digital modern dengan terjemahan Bahasa Indonesia, audio murottal, jadwal sholat, arah kiblat, dzikir, doa, Asmaul Husna, dan kalender Hijriah.

## ✨ Fitur

- 📖 **Al-Qur'an lengkap** — 114 surah dengan terjemahan Bahasa Indonesia, tafsir Kemenag, dan audio murottal
- 🎧 **Audio murottal** — Per surah & per ayat dengan multiple CDN fallback (Al-Afasy)
- ⏰ **Jadwal sholat** — Akurat via Aladhan API dengan metode KEMENAG Indonesia
- 🧭 **Arah kiblat** — Kompas digital dengan sensor device untuk akurasi real-time
- 📿 **Dzikir & Doa** — Counter dzikir pagi/petang, 25+ kumpulan doa harian
- 🌙 **Kalender Hijriah** — Konversi Masehi ↔ Hijriah dengan hari besar Islam
- ⭐ **Asmaul Husna** — 99 nama-nama Allah dengan detail lengkap
- 🕌 **Puasa Sunnah** — Panduan puasa sunnah dengan tanggal otomatis (Senin/Kamis, Ayyamul Bidh, Asyura, dll)
- 📺 **Live Makkah & Madinah** — Streaming langsung dari Masjidil Haram & Masjid Nabawi
- 🔖 **Bookmark & Catatan** — Simpan ayat favorit & tulis refleksi pribadi
- 📊 **Statistik bacaan** — Streak harian, total ayat, surah yang pernah dibuka
- 📱 **PWA** — Install ke home screen, support offline, push updates
- 🌗 **Dark mode** — Tema terang/gelap otomatis mengikuti sistem
- 📡 **Offline mode** — Service Worker cache untuk akses tanpa internet

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Routing**: React Router v6 dengan code splitting
- **UI**: shadcn/ui + Radix UI primitives + Tailwind CSS
- **State**: TanStack Query (server state) + React Context (client state)
- **Audio**: HTML5 Audio dengan multiple CDN fallback
- **PWA**: Service Worker + Web App Manifest
- **Storage**: localStorage (bookmark, notes, stats, dzikir counter)
- **APIs**: equran.id (Al-Qur'an), Aladhan (jadwal sholat), OSM Nominatim (geocoding)

## 📦 Setup

```bash
# Install dependencies
npm install

# Development
npm run dev          # http://localhost:8080

# Production
npm run build        # Build to dist/
npm run preview      # Preview production build
```

## 🚀 Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

Verifikasi `vercel.json` ada untuk SPA rewrites + cache headers + security headers.

## 📂 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui primitives
│   └── *.tsx         # Custom components
├── pages/            # Route pages (lazy-loaded)
├── contexts/         # React Context providers (audio, etc)
├── hooks/            # Custom hooks
│   ├── use-*.ts      # State hooks
│   └── use-*.tsx     # Context providers
├── lib/              # Pure functions & utilities
├── data/             # Static data (dzikir, doa, asmaul husna, dll)
├── types/            # TypeScript type definitions
├── utils/            # Helper utilities
└── styles/           # Global CSS
```

## 🌐 API Sources

- **Al-Qur'an & Terjemahan**: [equran.id](https://equran.id)
- **Jadwal Sholat**: [Aladhan](https://aladhan.com)
- **Audio Murottal**: [QuranicAudio.com](https://quranicaudio.com) (Al-Afasy)
- **Geocoding**: [OpenStreetMap Nominatim](https://nominatim.org)
- **IP Geolocation**: [ip-api.com](http://ip-api.com)

## ♿ Accessibility

- Semantic HTML (header, main, nav, section, article)
- ARIA labels & roles untuk icon-only buttons
- Skip link ke main content
- Keyboard navigable (Tab, Enter, Arrow keys)
- Focus management untuk dialogs
- `prefers-reduced-motion` support
- High contrast colors (WCAG AAA)

## 📊 Performance

- Code splitting per route (lazy loading)
- TanStack Query dengan staleTime yang sesuai (24h untuk static data)
- Service Worker cache strategy (NetworkFirst untuk API, CacheFirst untuk static)
- Optimistic UI updates
- Memoization untuk expensive computations

## 🔒 Security

- HTTPS-only untuk API calls dengan API keys
- Content Security Policy ready
- XSS protection (React auto-escape)
- No sensitive data di localStorage

## 🐛 Known Issues

- `apple-touch-icon` masih SVG — idealnya PNG 180x180 untuk iOS home screen reliability
- `og:image` masih SVG — idealnya PNG 1200x630 untuk social media preview terbaik
- Aplikasi tidak support IE11 (target modern browsers only)

## 📜 Lisensi

MIT

## 🤝 Kontributor

[Dyad AI](https://dyad.sh) — Generated with love for Muslim community.

---

**Doa**: "Ya Allah, berkahilah umat Islam dalam urusan mereka, dan selamatkanlah negeri kami dari segala bencana."