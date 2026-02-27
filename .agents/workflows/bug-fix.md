---
description: Systematic process for identifying and fixing bugs
---

# Workflow: Bug Fix

Bir hata raporlandığında veya keşfedildiğinde sırayla bu adımları izle.

---

## Adımlar

### 1. Hatayı Yeniden Üret

```bash
# Branch oluştur
git checkout develop
git pull
git checkout -b fix/<kısa-açıklama>
```

- Hatayı minimum adımla yeniden üret.
- Hangi koşulda oluştuğunu belgele (tarayıcı, kullanıcı rolü, veri durumu).

### 2. Kök Nedeni Bul

Olası kaynakları sırayla kontrol et:

| Katman | Kontrol |
|--------|---------|
| UI | Component props, render koşulları |
| Hook | Query/mutation state, cache tutarsızlığı |
| Servis | API yanıtı parse edilmesi, URL parametreleri |
| Tip | TypeScript narrow hatası, runtime tip hatası |
| Network | Chrome DevTools Network tab |

### 3. Düzelt

- Düzeltme kapsamını dar tut — ilgisiz iyileştirmeler bu PR'a girmez.
- `any` ile hızlı fix yapma — doğru tipi bul.
- Test yaz: hatanın tekrar oluşmadığını kanıtla.

```bash
# Test çalıştır
pnpm test
```

### 4. Doğrula

- [ ] Hata artık oluşmuyor
- [ ] Mevcut testler geçiyor
- [ ] Yeni test yazıldı (mümkünse)
- [ ] Edge case'ler test edildi
- [ ] Başka bir şeyi bozmadı (regression)

### 5. Commit & PR

```bash
git add .
git commit -m "fix(<scope>): <kısa açıklama>

Fixes #<issue-numarası>

Kök neden: <açıklama>
Düzeltme: <açıklama>"

git push origin fix/<kısa-açıklama>
```

PR açarken:
- **What**: Neyin düzeltildiği
- **Root cause**: Neden oluşuyordu
- **How to verify**: Test adımları
- **Screenshot**: Varsa before/after
