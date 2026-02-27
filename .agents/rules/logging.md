---
trigger: always_on
glob:
description: Logging, monitoring, observability, and error tracking standards
---

# Logging & Monitoring Rules

## Logging Yaklaşımı

Production'da `console.log` kullanılmaz. Tüm loglama yapılandırılmış bir logger üzerinden geçer.

```ts
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'test') return;

  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  // Production: JSON structured output (log aggregator için)
  if (process.env.NODE_ENV === 'production') {
    process.stdout.write(JSON.stringify(entry) + '\n');
  } else {
    // Development: okunabilir format
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    console[level === 'debug' ? 'log' : level](`${prefix} ${message}`, context ?? '');
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
};
```

## Ne Zaman Log Atılır

| Olay | Level | Örnek |
|------|-------|-------|
| Kullanıcı girişi / çıkışı | `info` | `logger.info('User logged in', { userId })` |
| Başarısız auth denemesi | `warn` | `logger.warn('Failed login attempt', { email, ip })` |
| API hatası (5xx) | `error` | `logger.error('DB query failed', { error, query })` |
| Kritik işlem (silme, rol değişikliği) | `info` | `logger.info('User deleted', { deletedBy, targetId })` |
| Rate limit aşımı | `warn` | `logger.warn('Rate limit exceeded', { ip, endpoint })` |
| Debug bilgisi | `debug` | Yalnızca development ortamında |

## Frontend Error Tracking (Sentry)

```ts
// instrumentation.ts (Next.js 15)
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@sentry/nextjs');
    init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // PII filtreleme
      beforeSend(event) {
        // Email, token vb. hassas veri temizle
        if (event.request?.cookies) {
          event.request.cookies = {};
        }
        return event;
      },
    });
  }
}
```

### Sentry Kullanım Kuralları

- Sentry'ye gelen event'lerde PII (email, isim, IP) gizlenir veya hash'lenir.
- Her `catch` bloğunda yakalanan error Sentry'ye raporlanır:

```ts
import * as Sentry from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: 'UserTable', action: 'bulkDelete' },
    extra: { userIds: selectedIds },
  });
  logger.error('Bulk delete failed', { error, userIds: selectedIds });
  throw error;
}
```

## Performance Monitoring

```ts
// Web Vitals — app/layout.tsx
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  if (process.env.NODE_ENV !== 'production') return;

  // Vercel Analytics, Datadog veya özel endpoint'e gönder
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(metric),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {/* sessizce başarısız ol */});
}
```

Takip edilmesi gereken Core Web Vitals hedefleri:

| Metrik | Hedef |
|--------|-------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID / INP | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTFB (Time to First Byte) | < 800ms |

## Health Check Endpoint

```ts
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  } catch {
    return NextResponse.json({ status: 'error', db: 'unreachable' }, { status: 503 });
  }
}
```

## Audit Log (Denetim İzi)

Hassas işlemler için veritabanına audit log yazılır:

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String   @map("user_id")
  action     String   // "user.delete", "role.change", "export.download"
  resource   String   // "users", "orders"
  resourceId String?  @map("resource_id")
  metadata   Json?
  ip         String?
  userAgent  String?  @map("user_agent")
  createdAt  DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

```ts
// lib/audit.ts
export async function logAudit(params: {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  request?: NextRequest;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      ...params,
      ip: params.request?.ip ?? params.request?.headers.get('x-forwarded-for') ?? null,
      userAgent: params.request?.headers.get('user-agent') ?? null,
    },
  });
}
```

## Kontrol Listesi

- [ ] `console.log` production kodunda yok
- [ ] `logger` üzerinden structured logging yapılıyor
- [ ] Sentry DSN production ortamında konfigüre
- [ ] Health check endpoint'i mevcut ve monitored
- [ ] Kayda değer işlemler audit log'a yazılıyor
- [ ] Web Vitals izleniyor
