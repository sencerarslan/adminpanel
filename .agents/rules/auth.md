---
trigger: always_on
glob:
description: Page-based user permissions, auth, session management, and API protection
---

# Auth & Authorization Rules

## Authentication Strategy

- Auth: JWT, short-lived access token + long-lived refresh token.
- Her iki token da yalnızca **httpOnly, Secure, SameSite=Strict cookie** olarak saklanır. `localStorage` kesinlikle yasak.
- Token her API isteğine `lib/api.ts` interceptor'ı ile eklenir — servis fonksiyonlarında manuel eklenmez.

## Token Yaşam Döngüsü

- **Access token**: 15 dakika (`JWT_ACCESS_EXPIRES_IN` env).
- **Refresh token**: 7 gün (`JWT_REFRESH_EXPIRES_IN` env).
- **Refresh akışı**: Axios 401 alınca otomatik refresh; bekleyen istekler kuyruklanır, refresh sonrası tekrar gönderilir.
- **Logout**: Server'da refresh token iptal edilir, cookie temizlenir, `/login`'e yönlendirir.

## Route Protection (Middleware)

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest): NextResponse {
  const token = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!token && !isPublic) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  if (token && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
```

## Yetkilendirme Modeli: Sayfa Bazlı Kullanıcı İzinleri

**Rol tabanlı değil, kullanıcı + sayfa bazlı granüler izin sistemi.**

Her kullanıcı, her sayfa/kaynak için bağımsız izinlere sahiptir:

| İzin | Anlamı |
|------|--------|
| `view` | Sayfayı görebilir, listeleyebilir |
| `create` | Yeni kayıt oluşturabilir |
| `update` | Mevcut kaydı düzenleyebilir |
| `delete` | Kayıt silebilir |

### Veritabanı Şeması

```prisma
model PagePermission {
  id       String  @id @default(cuid())
  userId   String  @map("user_id")
  pageKey  String  @map("page_key")   // örn. "users", "orders", "reports"
  canView  Boolean @default(false) @map("can_view")
  canCreate Boolean @default(false) @map("can_create")
  canUpdate Boolean @default(false) @map("can_update")
  canDelete Boolean @default(false) @map("can_delete")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, pageKey])
  @@index([userId])
  @@map("page_permissions")
}
```

### Page Key Sabitleri

```ts
// src/constants/pages.ts
export const PAGE_KEYS = {
  USERS: 'users',
  ORDERS: 'orders',
  PRODUCTS: 'products',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const;

export type PageKey = typeof PAGE_KEYS[keyof typeof PAGE_KEYS];
```

### Permission Tipi

```ts
// src/types/auth.types.ts
export interface PagePermission {
  pageKey: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface AuthUser {
  readonly id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isSuperAdmin: boolean;            // superAdmin tüm izinleri otomatik alır
  permissions: PagePermission[];    // sayfa bazlı izinler
}
```

### Auth Store

```ts
// store/authStore.ts
import { create } from 'zustand';
import type { AuthUser, PagePermission } from '@/types/auth.types';
import type { PageKey } from '@/constants/pages';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  getPagePermission: (pageKey: PageKey) => PagePermission | null;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  getPagePermission: (pageKey) => {
    const { user } = get();
    if (!user) return null;
    if (user.isSuperAdmin) {
      // superAdmin her şeyi yapabilir
      return { pageKey, canView: true, canCreate: true, canUpdate: true, canDelete: true };
    }
    return user.permissions.find((p) => p.pageKey === pageKey) ?? null;
  },
}));
```

### usePagePermission Hook

```ts
// hooks/usePagePermission.ts
import { useAuthStore } from '@/store/authStore';
import type { PageKey } from '@/constants/pages';

export interface UsePagePermissionReturn {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isLoading: boolean;
}

export function usePagePermission(pageKey: PageKey): UsePagePermissionReturn {
  const { getPagePermission, isLoading } = useAuthStore();
  const perm = getPagePermission(pageKey);

  return {
    canView: perm?.canView ?? false,
    canCreate: perm?.canCreate ?? false,
    canUpdate: perm?.canUpdate ?? false,
    canDelete: perm?.canDelete ?? false,
    isLoading,
  };
}
```

### Kullanım — Bileşende

```tsx
// components/features/users/UsersPage.tsx
'use client';
import { usePagePermission } from '@/hooks/usePagePermission';
import { PAGE_KEYS } from '@/constants/pages';

export function UsersPage(): React.JSX.Element {
  const { canView, canCreate, canDelete } = usePagePermission(PAGE_KEYS.USERS);

  if (!canView) {
    return <AccessDenied />;
  }

  return (
    <div>
      {canCreate && <Button>Yeni Kullanıcı</Button>}
      <UserTable showDeleteAction={canDelete} />
    </div>
  );
}
```

## API Route Yetki Kontrolü

Tüm Route Handler'lar server tarafında bağımsız olarak doğrular:

```ts
// app/api/users/route.ts
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await validateSession(request);
  if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });

  if (!requirePagePermission(session.user, PAGE_KEYS.USERS, 'canView')) {
    return NextResponse.json({ message: 'Bu sayfaya erişim yetkiniz yok' }, { status: 403 });
  }
  // ...
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await validateSession(request);
  if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });

  if (!requirePagePermission(session.user, PAGE_KEYS.USERS, 'canDelete')) {
    return NextResponse.json({ message: 'Silme yetkiniz yok' }, { status: 403 });
  }
  // ...
}
```

```ts
// lib/rbac.ts
import type { AuthUser } from '@/types/auth.types';
import type { PageKey } from '@/constants/pages';

type PermissionAction = 'canView' | 'canCreate' | 'canUpdate' | 'canDelete';

export function requirePagePermission(
  user: AuthUser,
  pageKey: PageKey,
  action: PermissionAction,
): boolean {
  if (user.isSuperAdmin) return true;
  const perm = user.permissions.find((p) => p.pageKey === pageKey);
  return perm?.[action] ?? false;
}
```

## SuperAdmin

- `isSuperAdmin: true` olan kullanıcılar tüm sayfalara tam erişime sahiptir.
- SuperAdmin durumu veritabanında `users.isSuperAdmin` boolean alanıyla tutulur.
- UI'da SuperAdmin için izin yönetimi ekranı gösterilmez.

## İzin Yönetim Sayfası

Admin kullanıcıları, diğer kullanıcıların sayfa izinlerini yönetebilir:

```
/settings/permissions
└── Kullanıcı seç → sayfa iznini checkbox ile ayarla
    ├── users:   [view] [create] [update] [delete]
    ├── orders:  [view] [create] [update] [delete]
    └── reports: [view] [ -    ] [ -    ] [ -    ]
```

## Güvenlik Kontrol Listesi

- [ ] Token yalnızca httpOnly cookie'de
- [ ] Middleware tüm protected route'ları kapsıyor
- [ ] Her API endpoint'i session + sayfa izni doğruluyor
- [ ] SuperAdmin kontrolü server tarafında yapılıyor
- [ ] `callbackUrl` allowlist'e göre doğrulanıyor
- [ ] Şifre sıfırlama token'ları tek kullanımlık ve 1 saatte expire
