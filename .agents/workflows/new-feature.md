---
description: Step-by-step workflow for developing a new feature end-to-end
---

# Workflow: New Feature Development

Yeni bir domain feature'ı (örn. ürünler, siparişler, raporlar) geliştirirken sırayla adımları izle.

---

## Adımlar

### 1. Domain Tipi Tanımla

```bash
# Dosya: src/types/<domain>.types.ts
```

- Interface ve type tanımları
- DTO tipleri (`CreateDto`, `UpdateDto`)
- Filtre tipi (`<Domain>Filters`)

### 2. Servis Fonksiyonunu Yaz

```bash
# Dosya: src/services/<domain>Service.ts
```

- `getList(filters)` — sayfalı liste
- `getById(id)` — tekil kayıt
- `create(payload)` — oluştur
- `update(id, payload)` — güncelle
- `delete(id)` — sil

### 3. Query Key'leri Ekle

```bash
# Dosya: src/constants/queryKeys.ts
```

```ts
<domain>: {
  all: ['<domain>'] as const,
  list: (filters) => ['<domain>', 'list', filters] as const,
  detail: (id) => ['<domain>', id] as const,
},
```

### 4. TanStack Query Hook'larını Yaz

```bash
# Dosya: src/hooks/use<Domain>.ts
```

- `use<Domain>s(filters)` — liste query
- `use<Domain>(id)` — tekil query
- `useCreate<Domain>()` — mutation
- `useUpdate<Domain>()` — mutation
- `useDelete<Domain>()` — mutation

### 5. Bileşen Klasörünü Oluştur

```bash
src/components/features/<domain>/
  <Domain>Table.tsx
  <Domain>Form.tsx
  <Domain>RowActions.tsx
  columns.tsx
  index.ts
```

### 6. Sayfa Dosyasını Oluştur

```bash
src/app/(dashboard)/<domain>/page.tsx
src/app/(dashboard)/<domain>/[id]/page.tsx  # detay sayfası gerekirse
```

- `export const metadata` tanımla
- Route guard kontrol et (`middleware.ts`)

### 7. Navigation'a Ekle

```bash
# Dosya: src/constants/navigation.ts (veya Sidebar bileşeni)
```

### 8. Doğrula

- [ ] Loading state mevcut (skeleton)
- [ ] Empty state mevcut
- [ ] Error state + retry mevcut
- [ ] Toast bildirimleri (success / error)
- [ ] Silme işlemi `AlertDialog` ile korunuyor
- [ ] Keyboard navigasyonu çalışıyor
- [ ] Dark mode doğru görünüyor
- [ ] TypeScript hata yok (`pnpm tsc --noEmit`)
- [ ] ESLint temiz (`pnpm lint`)

### 9. Commit

```bash
git add .
git commit -m "feat(<domain>): add <domain> management feature"
```
