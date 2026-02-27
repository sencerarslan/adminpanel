---
description: Prisma ORM setup, schema conventions, and migration workflow for PostgreSQL
---

# Skill: Database (Prisma + PostgreSQL)

Bu skill, veritabanı şeması tasarımı, Prisma kurulumu ve migration yönetimini kapsar.

---

## Kurulum

```bash
pnpm add prisma @prisma/client
pnpm prisma init
```

`prisma/schema.prisma` içinde PostgreSQL provider:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Prisma Client Singleton (`lib/prisma.ts`)

Next.js development modunda hot reload sırasında birden fazla Prisma client oluşmasını önle:

```ts
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## Şema Konvansiyonları

```prisma
model User {
  id        String    @id @default(cuid())      // cuid() tercih edilir (UUID yerine)
  email     String    @unique
  name      String
  role      UserRole  @default(VIEWER)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")        // soft delete için

  @@map("users")                                 // snake_case tablo adı
}

enum UserRole {
  ADMIN
  EDITOR
  VIEWER
}
```

### Kurallar

- **ID**: `cuid()` (URL-safe, sıralanabilir). UUID de kabul edilir.
- **Timestamps**: Her model `createdAt` ve `updatedAt` içerir.
- **Soft delete**: Kalıcı silme yerine `deletedAt` alanı kullanılır.
- **Tablo adları**: `@@map("snake_case")` ile veritabanında snake_case.
- **Alan adları**: Prisma'da camelCase, DB'de `@map("snake_case")`.
- **İlişkiler**: `onDelete: Cascade` veya `Restrict` — kasıtlı seçilmeli.

## Migration Workflow

```bash
# Şemayı değiştirdikten sonra migration oluştur
pnpm prisma migrate dev --name add_product_table

# Production'da uygula
pnpm prisma migrate deploy

# Prisma Studio (görsel DB tarayıcısı)
pnpm prisma studio

# Client'ı yeniden oluştur (şema değişikliği sonrası)
pnpm prisma generate
```

## Seed Verisi

```ts
// prisma/seed.ts
import { prisma } from '../src/lib/prisma';

async function main(): Promise<void> {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

`package.json`'a ekle:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Çalıştır: `pnpm prisma db seed`

## Soft Delete Helper

```ts
// src/lib/softDelete.ts
import { prisma } from '@/lib/prisma';

export async function softDelete(model: string, id: string): Promise<void> {
  await (prisma as Record<string, unknown>)[model].update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
```

Sorgularda soft-deleted kayıtları dışla:

```ts
const users = await prisma.user.findMany({
  where: { deletedAt: null },
});
```

## Docker — Veritabanına Bağlanma

```bash
# Container içinden psql
docker exec -it adminpanel_db psql -U adminpanel -d adminpanel_dev

# Dışarıdan (pgcli, TablePlus, DBeaver vb.)
Host: localhost | Port: 5432 | DB: adminpanel_dev | User: adminpanel
```

## Kontrol Listesi

- [ ] `DATABASE_URL` `.env.local`'da tanımlı
- [ ] `prisma.ts` singleton kuruldu
- [ ] Her model `createdAt`, `updatedAt` içeriyor
- [ ] Tablo adları `@@map` ile snake_case
- [ ] Migration dosyaları commit'e dahil
- [ ] Seed script çalışıyor
