---
trigger: always_on
glob:
description: Deployment pipeline, CI/CD configuration, and environment management
---

# Deployment & CI/CD Rules

## Branch → Ortam Eşleşmesi

| Branch | Ortam | URL |
|--------|-------|-----|
| `develop` | Staging | `staging.adminpanel.example.com` |
| `main` | Production | `adminpanel.example.com` |
| `feature/*`, `fix/*` | Preview (Vercel) | PR'a bağlı otomatik URL |

## CI Pipeline (GitHub Actions)

Her PR'da şu adımlar sırayla çalışır:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      # Paralel çalıştır
      - name: Type check
        run: pnpm tsc --noEmit

      - name: Lint
        run: pnpm eslint . --max-warnings 0

      - name: Format check
        run: pnpm prettier --check .

      - name: Tests
        run: pnpm test --run --coverage

      - name: Security audit
        run: pnpm audit --audit-level high

      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
```

## CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

      - name: Run DB migrations
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_PROD }}

      - name: Notify Sentry of release
        run: |
          sentry-cli releases new ${{ github.sha }}
          sentry-cli releases finalize ${{ github.sha }}
```

## Ortam Yönetimi

### Ortam Dosyaları

```
.env.example        ← git'te; tüm değişkenler açıklamalarıyla
.env.local          ← git'te DEĞİL; development için
.env.test           ← test ortamı (hassas değer içerme)
.env.production     ← git'te DEĞİL; CI secret olarak inject
```

### Vercel Ortam Değişkenleri

```bash
# Vercel CLI ile production secret ayarla
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add SENTRY_DSN production
```

## Database Migration Stratejisi

### Development

```bash
# Şema değişikliği + migration
pnpm prisma migrate dev --name <migration-name>

# Migration'ı sıfırla (development only!)
pnpm prisma migrate reset
```

### Production (Sıfırsız Deployment)

- Migration'lar her zaman **backward compatible** yazılır.
- Sütun silme 2 aşamada yapılır:
  1. Önce uygulamayı kolonu okumayacak şekilde deploy et.
  2. Sonraki release'te kolon drop migration'ını çalıştır.
- `NOT NULL` kolonu mevcut tabloya eklerken `DEFAULT` değeri ile başla, sonra kısıtı sıkılaştır.

```bash
# Production migration
pnpm prisma migrate deploy
```

## Docker Production Build

```dockerfile
# Dockerfile
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

## Release Checklist

Yeni bir production release'ten önce:

- [ ] `develop` → `main` PR onaylandı
- [ ] CI tüm adımları geçti (lint, type-check, tests, build)
- [ ] Staging ortamda manuel test yapıldı
- [ ] Database migration'ları backward compatible
- [ ] `.env.example` güncel (yeni değişkenler eklendiyse)
- [ ] `CHANGELOG.md` güncellendi
- [ ] Sentry release tag'i oluşturuldu
- [ ] Rollback planı mevcut (migration geri alınabilir mi?)

## Rollback

```bash
# Vercel — önceki deployment'a döndür
vercel rollback

# Database — migration geri al (dikkatli!)
pnpm prisma migrate resolve --rolled-back <migration-name>
```

> **Uyarı**: Veri silen migration'lar geri alınamaz. Silme işlemlerinden önce backup al.
