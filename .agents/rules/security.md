---
trigger: always_on
glob:
description: Security hardening rules — CSP, input validation, secret management, API protection
---

# Security Rules

## HTTP Security Headers

Next.js `next.config.ts` içinde aşağıdaki güvenlik başlıkları zorunludur:

```ts
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // next.js gereksinimi
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig = {
  headers: async () => [
    { source: '/(.*)', headers: securityHeaders },
  ],
};
```

## Input Validation & Sanitization

- **Her kullanıcı girdisi** Zod schema ile sunucu tarafında validate edilir — client-side validasyon tek başına yeterli değildir.
- HTML içeriği render edilecekse (`dangerouslySetInnerHTML`) mutlaka `DOMPurify` ile sanitize edilir.
- SQL injection: Prisma parametrized query kullandığı için raw query yasaktır; zorunluysa `Prisma.$queryRaw` template literal syntax'ı kullanılır.

```ts
// ✅ Safe — parametrized
const users = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;

// ❌ UNSAFE — SQL injection riski
const users = await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${userId}'`);
```

## Secret Management

- Tüm sırlar `.env.local` dosyasında tutulur, asla kaynak koda gömülmez.
- `.env.example` placeholder değerlerle commit edilir; gerçek değerler asla commit'e girmez.
- `NEXT_PUBLIC_` prefix'i yalnızca gerçekten public olan değerlerde kullanılır.
- Sır rotasyonu planı belirlenir; JWT secret en az 256-bit entropy içerir.

```bash
# Güçlü JWT secret üretmek için:
openssl rand -base64 64
```

## API Route Protection

Her Route Handler başında 3 katmanlı kontrol yapılır:

```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Auth kontrolü
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
  }

  // 2. Permission kontrolü
  const hasPermission = requirePermission(session.user, 'users:read');
  if (!hasPermission) {
    return NextResponse.json({ message: 'Bu işlem için yetkiniz yok' }, { status: 403 });
  }

  // 3. Input validation
  const { searchParams } = new URL(request.url);
  const filters = userFiltersSchema.safeParse(Object.fromEntries(searchParams));
  if (!filters.success) {
    return NextResponse.json({ message: 'Geçersiz parametreler' }, { status: 400 });
  }

  // İş mantığı...
}
```

## Rate Limiting

Brute-force ve abuse koruması için rate limiting uygulanır:

```ts
// lib/rateLimit.ts — upstash/redis veya in-memory (dev)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 15 dakikada 5 deneme
  analytics: true,
});
```

```ts
// app/api/auth/login/route.ts
const { success, remaining } = await loginRateLimit.limit(ip);
if (!success) {
  return NextResponse.json(
    { message: 'Çok fazla başarısız giriş denemesi. Lütfen 15 dakika bekleyin.' },
    { status: 429 }
  );
}
```

Rate limiting uygulanacak endpoint'ler:
- `POST /api/auth/login` — 5 / 15 dakika
- `POST /api/auth/register` — 3 / saat
- `POST /api/auth/forgot-password` — 3 / saat
- Genel API — 100 / dakika (kullanıcı başına)

## CORS

Next.js Route Handlers varsayılan olarak CORS'u reddet; yalnızca belirli origin'lere izin ver:

```ts
// middleware.ts içinde veya route handler'da
const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL];

export function withCors(handler: NextResponse): NextResponse {
  const origin = request.headers.get('origin');
  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse(null, { status: 403 });
  }
  // ...
}
```

## Dependency Security

```bash
# Bilinen açıkları tara
pnpm audit

# Otomatik düzeltme (minor/patch)
pnpm audit --fix
```

- `dependabot` veya `renovate` ile bağımlılıklar otomatik güncellenir.
- `pnpm audit` CI pipeline'ına eklenir; `high` veya `critical` bulunursa build başarısız olur.

## Güvenlik Kontrol Listesi

- [ ] Security headers `next.config.ts`'de tanımlı
- [ ] Tüm API endpoint'leri auth + permission kontrolü yapıyor
- [ ] Rate limiting login ve hassas endpoint'lerde aktif
- [ ] Kullanıcı girdisi sunucu tarafında validate ediliyor
- [ ] `pnpm audit` CI'da çalışıyor
- [ ] JWT secret en az 256-bit
- [ ] `.env` dosyaları `.gitignore`'da
- [ ] Prisma raw query kullanılmıyor (zorunlu değilse)
