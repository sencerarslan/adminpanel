---
description: UI component library conventions, shadcn/ui usage, and design system patterns
---

# Skill: UI Component System

Bu skill, shadcn/ui tabanlı tasarım sisteminin nasıl kullanılacağını ve genişletileceğini tanımlar.

---

## shadcn/ui Kurulum & Bileşen Ekleme

```bash
# Kurulum (proje başlangıcında bir kez)
pnpm dlx shadcn@latest init

# Bileşen ekleme
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add dropdown-menu
```

Bileşenler `src/components/ui/` klasörüne kopyalanır — NPM paketi değil, kaynak kodun kendisi.

---

## Mevcut Bileşenler — Kontrol Et

Yeni bileşen oluşturmadan önce [shadcn/ui kataloğundan](https://ui.shadcn.com/docs/components) kontrol et:

| İhtiyaç | shadcn Bileşeni |
|---------|----------------|
| Buton | `Button` |
| Modal | `Dialog` |
| Confirm | `AlertDialog` |
| Açılır menü | `DropdownMenu` |
| Çekmece panel | `Sheet` |
| Tooltip | `Tooltip` |
| Badge | `Badge` |
| Seçim kutusu | `Checkbox` |
| Radio | `RadioGroup` |
| Toggle | `Switch` |
| Tarih seçici | `Calendar` + `Popover` |
| Seçim listesi | `Select` veya `Combobox` |
| Tab'lar | `Tabs` |
| Sayfa içi bildirim | `Alert` |
| Veri kartı | `Card` |
| Bölücü | `Separator` |
| İlerleme | `Progress` |
| Kazıyıcı | `Skeleton` |

---

## Bileşen Genişletme

shadcn bileşenlerini direkt olarak değiştirme — `className` ve `variant` ile genişlet:

```tsx
// ✅ Doğru — mevcut bileşeni compose et
import { Button } from '@/components/ui/Button';

export function DestructiveButton({ ...props }: React.ComponentPropsWithoutRef<typeof Button>) {
  return (
    <Button variant="destructive" {...props} />
  );
}

// ❌ Yanlış — shadcn kaynak kodunu doğrudan değiştirme
// src/components/ui/Button.tsx'i düzenlemek yerine wrapper oluştur
```

---

## cva ile Variant Yönetimi

```ts
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      status: {
        active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      },
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps): React.JSX.Element {
  return <span className={cn(statusBadgeVariants({ status }), className)} />;
}
```

---

## Modal / Dialog Pattern

```tsx
// components/features/users/DeleteUserDialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
  isPending: boolean;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
  isPending,
}: DeleteUserDialogProps): React.JSX.Element {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{userName}</strong> adlı kullanıcıyı silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Siliniyor...' : 'Evet, Sil'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## Sheet (Yan Çekmece) Pattern

Uzun formlar, detay görünümleri veya hızlı düzenleme için `Sheet` kullan:

```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Kullanıcı Düzenle</SheetTitle>
      <SheetDescription>Kullanıcı bilgilerini güncelleyin.</SheetDescription>
    </SheetHeader>
    <div className="mt-6">
      <EditUserForm userId={userId} onSuccess={() => setOpen(false)} />
    </div>
  </SheetContent>
</Sheet>
```

---

## Skeleton Loading Pattern

Her bileşenin loading state'i için bileşenin şeklini taklit eden skeleton yaz:

```tsx
// components/features/users/UserCardSkeleton.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export function UserCardSkeleton(): React.JSX.Element {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[150px]" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}
```

---

## Kontrol Listesi

- [ ] Yeni UI ihtiyacında önce shadcn kataloğu kontrol edildi
- [ ] Bileşenler `src/components/ui/` içinde, barrel export (`index.ts`) güncellendi
- [ ] Tüm varyantlar `cva` ile tanımlandı
- [ ] Dark mode class'ları her bileşende mevcut
- [ ] Loading skeleton bileşenin gerçek şeklini taklit ediyor
- [ ] Modal/Dialog'larda focus trap çalışıyor
