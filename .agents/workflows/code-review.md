---
description: Code review checklist and guidelines for pull requests
---

# Workflow: Code Review

Bir PR incelenirken bu kontrol listesini sırayla uygula.

---

## Genel Kontroller

- [ ] PR küçük ve odaklı mı? (tek sorumluluk)
- [ ] Commit mesajları Conventional Commits formatında mı?
- [ ] `develop` branch'ine karşı açılmış mı?

## TypeScript & Tip Güvenliği

- [ ] `any` kullanılan yer var mı?
- [ ] Tüm API response'ları typed mi?
- [ ] `as` cast kullanılmış mı — gerekliyse tip-guard ile mi korunmuş?
- [ ] Yeni tipler `types/` altında mı tanımlanmış?

## Bileşen Kalitesi

- [ ] Bileşen 300 satırı geçiyor mu? (geçiyorsa bölünmeli)
- [ ] Server/Client boundary doğru mu? (`'use client'` gerekli yerde mi?)
- [ ] Props interface'i tanımlı ve `readonly` mi?
- [ ] `next/image` kullanılmış mı (`<img>` yok mu)?

## Veri Yönetimi

- [ ] `useEffect` içinde fetch yapılmış mı? (yasak)
- [ ] Query key'leri `queryKeys.ts`'den mi alıyor?
- [ ] Mutation'ların `onSuccess` ve `onError` handler'ları var mı?
- [ ] Cache invalidation doğru yapılmış mı?

## UI & Deneyim

- [ ] Loading state mevcut mu?
- [ ] Empty state mevcut mu?
- [ ] Error state + retry mevcut mu?
- [ ] Toast bildirimleri Türkçe mi?
- [ ] Destructive işlemler `AlertDialog` ile korunuyor mu?

## Erişilebilirlik

- [ ] İcon-only butonlarda `aria-label` var mı?
- [ ] Klavye navigasyonu çalışıyor mu?
- [ ] Focus ring kaldırılmamış mı?
- [ ] Form input'ları label ile ilişkilendirilmiş mi?

## Dark Mode & Responsive

- [ ] Tüm renkler semantic token veya dark variant içeriyor mu?
- [ ] Tablet (md breakpoint) görünümü bozulmamış mı?

## Güvenlik

- [ ] Token `localStorage`'a kaydedilmiş mi? (kaydedilmemeli)
- [ ] Kullanıcı girdisi XSS'e açık mı?
- [ ] RBAC kontrolü var mı (hem UI hem API)?

## Performans

- [ ] Büyük bileşenler `next/dynamic` ile lazy load edilmiş mi?
- [ ] Gereksiz `useMemo`/`useCallback` var mı?

## Onay

- Tüm `critical` ve `serious` sorunlar düzeltilmeden merge edilmez.
- UI değişikliklerinde screenshot zorunludur.
- CI (lint, type-check) geçmeden onay verilmez.
