---
description: Deployment, environment management, Docker, and production release workflow
---

# Skill: Deployment & DevOps

Bu skill, lokal geliştirmeden production'a deployment sürecini kapsar.

---

## Yerel Geliştirme Ortamı

### 1. Ortam Değişkenlerini Hazırla

```bash
cp .env.example .env.local
# .env.local'ı düzenle ve gerçek değerleri gir
```

### 2. Docker ile PostgreSQL Başlat

```bash
docker compose up -d

# Sağlık kontrolü
docker compose ps
docker compose logs postgres
```

### 3. Veritabanı Kurulumu

```bash
# Client'ı oluştur
pnpm prisma generate

# Şemayı uygula
pnpm prisma migrate dev --name init

# Seed verisi ekle
pnpm prisma db seed

# Studio ile kontrol et
pnpm prisma studio
```

### 4. Geliştirme Sunucusu

```bash
pnpm dev
# http://localhost:3000
```

---

## Staging Deployment

```bash
# develop branch'ından staging'e otomatik deploy (GitOps)
git push origin develop

# Manuel Vercel deploy
vercel --target staging
```

Staging ortam değişkenleri Vercel Dashboard'dan yönetilir.

---

## Production Deployment

```bash
# 1. develop → main merge (GitHub PR üzerinden)
# 2. CI pipeline'ın geçmesini bekle
# 3. GitHub Actions otomatik deploy eder

# Manuel deploy (acil durum)
vercel --prod --token $VERCEL_TOKEN
```

### Pre-deployment Checklist

```bash
# Type check
pnpm tsc --noEmit

# Lint
pnpm eslint . --max-warnings 0

# Test
pnpm test --run

# Build
pnpm build

# Güvenlik denetimi
pnpm audit --audit-level high
```

---

## Database Migration (Production)

```bash
# Staging'de test et
DATABASE_URL=$STAGING_DB_URL pnpm prisma migrate deploy

# Production'a uygula
DATABASE_URL=$PROD_DB_URL pnpm prisma migrate deploy
```

### Güvenli Migration Kuralları

- Migration'lar backward compatible olmalı.
- Sütun silme 2 adımda: önce kod değişikliği, sonra `DROP COLUMN`.
- `NOT NULL` ekleme 2 adımda: önce nullable + DEFAULT, sonra constraint.

---

## Docker — Veritabanı Yönetimi

```bash
# Container'ları başlat / durdur
docker compose up -d
docker compose stop

# Veriyi koru, container'ı yeniden oluştur
docker compose down && docker compose up -d

# Tüm veriyi sil (dikkatli!)
docker compose down -v

# PostgreSQL shell
docker exec -it adminpanel_db psql -U adminpanel -d adminpanel_dev

# Backup al
docker exec adminpanel_db pg_dump -U adminpanel adminpanel_dev > backup.sql

# Backup geri yükle
docker exec -i adminpanel_db psql -U adminpanel -d adminpanel_dev < backup.sql
```

---

## Rollback

```bash
# Vercel — önceki deployment'a dön
vercel rollback

# Database — son migration'ı geri al
pnpm prisma migrate resolve --rolled-back <migration-name>

# Sentry'de release'i işaretle
sentry-cli releases new $GITHUB_SHA
sentry-cli releases finalize $GITHUB_SHA
```

---

## Ortam Değişkeni Yönetimi

```bash
# Vercel'e secret ekle
vercel env add JWT_SECRET production
vercel env add DATABASE_URL production
vercel env add SENTRY_DSN production

# Mevcut değerleri listele
vercel env ls
```

---

## Kontrol Listesi

- [ ] `.env.example` güncel (yeni değişkenler eklendiyse)
- [ ] Migration'lar test edildi (staging'de)
- [ ] Sentry DSN production'da tanımlı
- [ ] Health check endpoint'i çalışıyor
- [ ] Rollback planı mevcut
