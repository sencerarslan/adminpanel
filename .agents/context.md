---
trigger: always_on
glob:
description: Fullstack project context — Next.js, Prisma, i18n, page-based permissions
---

# Project Context

## Proje Hakkında

Bu proje, modern bir **SaaS Admin Paneli**'dir. Şirket içi operasyonları (kullanıcı yönetimi, sipariş takibi, raporlama, içerik yönetimi vb.) yönetmek için kullanılır. Kullanıcı kitlesi teknik olmayan iç ekiplerdir; bu nedenle UX açıklık ve hız önceliklidir.

**Temel prensipler:**
- Veri bütünlüğü ve güvenlik en yüksek önceliktir.
- Performans ikinci önceliktir: p95 API yanıt süresi < 300ms.
- Developer experience — tutarlı kalıplar, minimal boilerplate.

## Teknoloji Yığını (Tech Stack)

### Frontend

| Katman | Teknoloji | Versiyon |
|--------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| Dil | TypeScript | 5.x |
| UI Kütüphanesi | shadcn/ui | latest |
| Styling | Tailwind CSS | 4.x |
| İkon | lucide-react | latest |
| Animasyon | tailwindcss-animate | latest |
| Form | React Hook Form + Zod | latest |
| Server State | TanStack Query (React Query) | v5 |
| Client State | Zustand | v5 |
| HTTP Client | Axios | latest |
| Tablo | TanStack Table | v8 |
| Toast | Sonner | latest |
| Date | date-fns | v3 |
| Tema | next-themes | latest |
| URL State | nuqs | latest |
| i18n | next-intl | latest |

### Backend & Altyapı

| Katman | Teknoloji |
|--------|-----------|
| Veritabanı | PostgreSQL 16 (Docker) |
| ORM | Prisma |
| Auth | JWT (httpOnly cookie) |
| API | Next.js Route Handlers + Server Actions |
| İzin Sistemi | Sayfa bazlı kullanıcı izinleri (PagePermission) |
| Container | Docker Compose |
| Error Tracking | Sentry |
| File Storage | (gerektiğinde S3 veya Cloudflare R2) |

### Geliştirme Araçları

| Araç | Amaç |
|------|-------|
| pnpm | Paket yöneticisi |
| ESLint | Kod kalitesi |
| Prettier | Kod formatı |
| Husky + lint-staged | Pre-commit hook |
| Vitest | Unit ve integration testleri |
| Playwright | E2E testleri |
| @next/bundle-analyzer | Bundle analizi |

## Mimari Kararlar (ADR)

### ADR-001: App Router (Pages Router değil)
**Karar**: Next.js App Router kullanılır.  
**Gerekçe**: RSC, layout nesting, nested routing ve streaming desteği. Pages Router legacy kabul edilir.  
**Trade-off**: Client/Server boundary karmaşıklığı artar ama performans kazanımı buna değer.

### ADR-002: shadcn/ui (tam kütüphane değil)
**Karar**: shadcn/ui bileşenleri kopyalanarak projeye dahil edilir.  
**Gerekçe**: Tam kontrol, bundle size optimizasyonu; kütüphane bağımlılığı yoktur.  
**Trade-off**: Upstream güncellemeler manuel alınır.

### ADR-003: TanStack Query (SWR veya native fetch değil)
**Karar**: TanStack Query tüm server state için kullanılır.  
**Gerekçe**: Cache invalidation, optimistic updates, devtools, mutation yönetimi — SWR bu konularda geride kalır.

### ADR-004: Zustand (Redux değil)
**Karar**: Client state Zustand ile yönetilir.  
**Gerekçe**: Minimal boilerplate, TypeScript desteği, basit API. Redux bu proje için aşırıya kaçar.

### ADR-005: Prisma (raw SQL veya Drizzle değil)
**Karar**: ORM olarak Prisma tercih edilir.  
**Gerekçe**: Schema-first yaklaşım, type safety, migration yönetimi ve Next.js entegrasyonu.

### ADR-006: PostgreSQL (SQLite veya MySQL değil)
**Karar**: PostgreSQL 16 kullanılır, Docker ile çalıştırılır.  
**Gerekçe**: JSON desteği, full-text search, robust transaction support. SQLite production için uygun değil.

### ADR-007: JWT cookie (NextAuth değil)
**Karar**: Özel JWT implementasyonu, httpOnly cookie.  
**Gerekçe**: Backend API ayrı olduğu için NextAuth'un OAuth entegrasyonuna ihtiyaç yoktur. Daha az bağımlılık.

### ADR-008: nuqs (URL state yönetimi)
**Karar**: Tablo filtre, arama ve sayfalama state'i URL'de `nuqs` ile yönetilir.  
**Gerekçe**: Derin link paylaşımı, tarayıcı back/forward desteği, bookmark yapılabilirlik.

### ADR-009: Sayfa Bazlı İzin Sistemi (Rol tabanlı değil)
**Karar**: Yetkilendirme; kullanıcı + sayfa + aksiyon üçlüsüyle modellenir.  
**Gerekçe**: Her kullanıcı her sayfa için farklı izin setine sahip olabilir (örn. Ali siparişleri görebilir ama silemez). Rol bazlı sistemler bu granülerliği sağlamaz.  
**Model**: `PagePermission(userId, pageKey, canView, canCreate, canUpdate, canDelete)`

### ADR-010: next-intl ile i18n (cookie tabanlı locale)
**Karar**: `next-intl` kullanılır; locale URL prefix'i olmadan cookie ile yönetilir.  
**Gerekçe**: Admin paneli internal kullanıma yönelik; URL'de locale taşımak gereksiz. Cookie tercih yeterli.  
**Varsayılan dil**: Türkçe (`tr`). Desteklenen: `['tr', 'en']`.

## Proje Kısıtları

- **Çoklu dil**: `next-intl` ile **TR** (varsayılan) ve **EN** desteklenir. Tüm UI string'leri `messages/*.json` dosyasından gelir — bileşen içine hardcoded metin yazılmaz.
- **SSR kısıtlaması**: Auth gerektiren sayfalar CSR (TanStack Query) üzerinden çalışır; SSR + cookie yönetimi karmaşıklığından kaçınılır.
- **Login sayfası**: SSG olarak render edilir; auth middleware ile korunur.
- **Yetkilendirme**: Rol tabanlı değil, sayfa + kullanıcı bazlı granüler izin sistemi. Her kullanıcı her sayfa için view/create/update/delete iznine ayrı ayrı sahip olabilir.
- **Mobil destek**: Admin panel desktop-first'tir ama tablet uyumluluğu zorunludur.
- **IE/Legacy tarayıcı**: Destek verilmez. Modern Chromium ve Firefox son 2 major versiyonu hedeflenir.
- **Bundle budget**: İlk JS yükü < 200KB (gzipped). Her route < 100KB.

## Domain Glossary (Sözlük)

AI'ın domain terimlerini doğru anlaması için:

| Terim | Açıklama |
|-------|----------|
| Kullanıcı | Sisteme giriş yapabilen admin panel kullanıcısı |
| Rol | Kullanıcı yetki seviyesi (`admin`, `editor`, `viewer`) |
| İzin (Permission) | Granüler yetki tanımı (`users:read`, `orders:delete`) |
| Sipariş (Order) | Müşteri siparişi |
| Ürün (Product) | Satışa sunulan ürün |
| Dashboard | Ana özet sayfa, metrikler |
| Rapor (Report) | Hazır veri görseli ve analiz sayfası |

## Klasör → Sorumluluk Eşleşmesi

```
src/app/(auth)/          → Login, şifre sıfırlama sayfaları
src/app/(dashboard)/     → Tüm korumalı sayfalar (layout'u paylaşır)
src/components/ui/       → shadcn/ui kopyaları + özel atomlar
src/components/layout/   → Sidebar, Header, Breadcrumb
src/components/features/ → Domain bileşenleri (users/, orders/, products/…)
src/hooks/               → Custom React hook'ları
src/lib/api.ts           → Axios instance (tek kaynak)
src/lib/auth.ts          → Session doğrulama yardımcıları
src/lib/prisma.ts        → Prisma singleton client
src/lib/utils.ts         → cn() ve genel utility'ler
src/lib/errors.ts        → normalizeError() yardımcısı
src/lib/audit.ts         → Audit log yazma fonksiyonu
src/lib/logger.ts        → Yapılandırılmış logger
src/services/            → Domain başına bir servis dosyası
src/store/               → Zustand slice'ları (authStore, uiStore, …)
src/types/               → Global TypeScript tipleri
src/constants/           → queryKeys, routes, enum-benzeri sabitler
prisma/
  schema.prisma          → Veritabanı şeması
  migrations/            → Migration geçmişi (commit'te)
  seed.ts                → Geliştirme seed verisi
```

## Ortam Değişkenleri

Tüm ortam değişkenleri `.env.example` dosyasında belgelenmiştir. Sırlar commit'e girmez.

```
NODE_ENV                  → Ortam (development | production | test)
NEXT_PUBLIC_APP_URL       → Uygulamanın public URL'i
NEXT_PUBLIC_API_URL       → Client-side API base URL
DATABASE_URL              → Prisma bağlantı URL'i
JWT_SECRET                → Token imzalama anahtarı (min 256-bit)
JWT_ACCESS_EXPIRES_IN     → Access token süresi (örn. 15m)
JWT_REFRESH_EXPIRES_IN    → Refresh token süresi (örn. 7d)
SENTRY_DSN                → Sentry hata takibi DSN
NEXT_PUBLIC_DEFAULT_LOCALE → Varsayılan locale (tr)
```

## Servislerin Birbiriyle İlişkisi

```
Browser
  └── Next.js (App Router)
        ├── Server Components  → Prisma (PostgreSQL)
        ├── Route Handlers     → Prisma / external services
        └── Client Components
              └── Axios → Route Handlers → Prisma
```
