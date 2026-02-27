---
description: End-to-end release process from feature freeze to production deployment
---

# Workflow: Release

Production'a yeni bir sürüm çıkarırken bu adımları izle.

---

## Adımlar

### 1. Feature Freeze

```bash
# develop'tan release branch oluştur
git checkout develop
git pull origin develop
git checkout -b release/v<major>.<minor>.<patch>
```

- Bu noktadan itibaren yalnızca bug fix commit'leri alınır.
- Yeni feature'lar bir sonraki release'e ertelenir.

### 2. Sürümü Güncelle

```bash
# package.json'daki version alanını güncelle
pnpm version <patch|minor|major> --no-git-tag-version

# CHANGELOG.md'yi güncelle (unreleased → version + tarih)
```

### 3. Staging'de Test Et

```bash
# Release branch'ini staging'e deploy et
vercel --target staging

# Manuel test kapsamı:
# [ ] Login / logout akışı
# [ ] Ana CRUD işlemleri (kullanıcı, sipariş vb.)
# [ ] Rol bazlı erişim kontrolü
# [ ] Tablo: sıralama, filtreleme, sayfalama
# [ ] Formlar: validasyon, submit, toast
# [ ] Dark mode / light mode geçişi
# [ ] Responsive (tablet görünümü)
```

### 4. QA Kontrol Listesi

- [ ] CI pipeline tüm check'leri geçti
- [ ] Staging'de kritik akışlar test edildi
- [ ] Database migration'ları backward compatible
- [ ] `.env.example` güncel
- [ ] Sentry'de önceki release'lerin hataları kapatıldı

### 5. Production'a Merge

```bash
# GitHub'da PR aç: release/* → main
# En az 1 approval al
# Squash-merge

# Sonra develop'u senkronize et
git checkout develop
git merge main
git push origin develop
```

### 6. Tag & Release

```bash
git tag -a v<version> -m "chore(release): v<version>"
git push origin v<version>
```

GitHub'da Release oluştur:
- Tag: `v<version>`
- Title: `v<version>`
- Body: CHANGELOG.md'den ilgili bölümü yapıştır

### 7. Production Deploy Doğrula

```bash
# Health check
curl https://adminpanel.example.com/api/health

# Sentry'de yeni hata yoktur kontrol et
# Vercel dashboard'da deployment durumunu kontrol et
# Core Web Vitals puanlarını kontrol et
```

### 8. Rollback (Gerekirse)

```bash
# Vercel — önceki deployment'a dön
vercel rollback

# Database migration rollback
pnpm prisma migrate resolve --rolled-back <migration-name>

# Sentry'de release'i işaretle
sentry-cli releases deploys $VERSION new -e production --name rollback
```

---

## Hotfix Süreci (Acil Bug)

```bash
# main'den direkt hotfix branch
git checkout main
git checkout -b fix/hotfix-<açıklama>

# Düzelt, test et
git commit -m "fix(<scope>): <fix açıklaması>"

# main ve develop'a merge
git checkout main && git merge fix/hotfix-<açıklama>
git checkout develop && git merge fix/hotfix-<açıklama>

# Version bump (patch) + tag
pnpm version patch --no-git-tag-version
git tag -a v<version> -m "fix(release): hotfix v<version>"
git push origin main develop --tags
```
