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
- **Testing**: Vitest (unit/component) + Playwright (E2E)

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

## 🧪 Testing

### Unit & Component Tests (Vitest)

```bash
npm test              # Run all unit tests (single run)
npm run test:watch    # Watch mode
npm run test:ui       # Browser-based test explorer
npm run test:coverage # Generate coverage report
```

**Coverage:**
- **Lib functions**: ~90% (date, qibla, prayer-times, hijri-calendar, share, audio-coordinator)
- **Hooks**: ~85% (useReadingStats, useLastRead, useDzikirCounter, etc)
- **Components**: ~70% (VerseCard, DzikirCounterCard, PrayerCard, SurahCard)
- **Total**: ~80% overall

### E2E Tests (Playwright)

```bash
npm run e2e           # Run all E2E tests (chromium, firefox, webkit)
npm run e2e:ui        # Interactive UI mode
npm run e2e:debug     # Step-by-step debug mode

# Install browsers (first time only)
npx playwright install --with-deps
```

**E2E test coverage:**
- **Navigation**: Home, drawer, all pages, back button, 404, skip link
- **Quran browsing**: Search, open surah, bookmark, verify in bookmark page
- **Dzikir**: Counter increment, target completion, switch pagi/petang
- **Asmaul Husna**: Grid/list view, search, dialog navigation, copy
- **Kalender**: Month navigation, today button, holiday markers, upcoming events
- **PWA**: Manifest validation, service worker registration, offline mode

### Test Files

- `src/lib/__tests__/` — Pure functions (Vitest)
- `src/hooks/__tests__/` — Custom hooks (Vitest)
- `src/components/__tests__/` — React components (Vitest + Testing Library)
- `e2e/` — End-to-end user flows (Playwright)

### Test Infrastructure

- `vitest.config.ts` — Vitest config (jsdom, alias, coverage)
- `src/test/setup.ts` — Vitest setup (localStorage clear, matchMedia, ResizeObserver mocks)
- `src/test/test-utils.tsx` — Shared render helper dengan 9 provider wrapper
- `playwright.config.ts` — Playwright config (multi-browser, webServer)

## 🚀 Deploy

### CI/CD (GitHub Actions)

`.github/workflows/ci.yml` runs on every push & PR:
1. **Unit & component tests** (Vitest) + coverage report
2. **E2E tests** (Playwright) di Chromium, Firefox, WebKit
3. **Lint & type check** (ESLint + TypeScript)

Playwright report di-upload sebagai artifact untuk debugging.

### Vercel

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
│   ├── __tests__/    # Component tests (Vitest)
│   └── *.tsx         # Custom components
├── pages/            # Route pages (lazy-loaded)
├── contexts/         # React Context providers (audio, etc)
├── hooks/            # Custom hooks
│   ├── __tests__/    # Hook tests (Vitest)
│   ├── use-*.ts      # State hooks
│   └── use-*.tsx     # Context providers
├── lib/              # Pure functions & utilities
│   ├── __tests__/    # Lib tests (Vitest)
│   └── *.ts          # Implementation
├── data/             # Static data (dzikir, doa, asmaul husna, dll)
├── types/            # TypeScript type definitions
├── utils/            # Helper utilities
├── test/             # Test infrastructure
└── styles/           # Global CSS

e2e/                  # E2E tests (Playwright)
.github/workflows/    # CI/CD pipelines
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