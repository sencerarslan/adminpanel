---
trigger: always_on
glob:
description: General project structure, architecture, naming conventions, error handling, and development workflow
---

# General Rules

## Project Architecture

- **Framework**: Next.js with App Router. Pages Router is never used.
- **Language**: TypeScript is mandatory across all files. `strict: true` in `tsconfig.json`.
- **Package manager**: pnpm is preferred. `npm` or `yarn` is not used.
- **Node version**: 22.x LTS.

### Folder Structure

```
src/
  app/
    (auth)/             # Login, forgot-password pages (public)
    (dashboard)/        # Protected pages sharing the dashboard layout
    api/                # Next.js Route Handlers
  components/
    ui/                 # Atomic/generic UI components (Button, Input, Modal…)
    layout/             # Header, Sidebar, Breadcrumb, PageHeader
    features/           # Domain-specific components (users/, orders/, products/…)
  hooks/                # Custom React hooks (use- prefix required)
  lib/                  # Utilities, API client, helpers
    api.ts              # Axios singleton
    auth.ts             # Session validation helpers
    prisma.ts           # Prisma singleton
    utils.ts            # cn() and general utilities
    errors.ts           # normalizeError()
    logger.ts           # Structured logger
    audit.ts            # Audit log writer
  services/             # API calls — one file per domain
  store/                # Global state (Zustand slices)
  types/                # Global TypeScript type definitions
  constants/            # queryKeys, routes, app-wide constants
  styles/               # Global CSS and design tokens
  middleware.ts         # Route protection (root of src/)
```

- Each feature has its own folder: `components/features/users/`, `components/features/orders/` etc.
- Barrel exports (`index.ts`) are required in every `components/ui/` and `components/features/` directory.
- `src/middleware.ts` is the single place for route-level auth/redirect logic.

## Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Component file | PascalCase | `UserTable.tsx` |
| Hook file | camelCase + `use` prefix | `useUserList.ts` |
| Utility / helper | camelCase | `formatDate.ts` |
| Service file | camelCase + `Service` suffix | `userService.ts` |
| Constants file | camelCase | `routes.ts` |
| Type file | camelCase or PascalCase | `user.types.ts` |
| Zod schema file | camelCase + `.schema.ts` | `user.schema.ts` |
| Store file | camelCase + `Store` suffix | `authStore.ts` |
| Test file | same name + `.test.ts(x)` | `UserTable.test.tsx` |

- All code (variables, functions, types) is written in **English**. No Turkish identifiers.
- Comments may be in Turkish or English; be consistent within a file.
- Event handler props: `on` prefix (`onDelete`, `onSubmit`).
- Event handler implementations: `handle` prefix (`handleDelete`, `handleSubmit`).
- Boolean variables/props: `is`, `has`, `can`, `should` prefix (`isLoading`, `hasError`).

## Import Order & Path Aliases

Use `@/` alias for all internal imports. Relative paths (`../../`) are forbidden beyond 1 level.

```ts
// ✅ Correct import order (enforced by ESLint)
// 1. React / Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// 3. Internal — types
import type { User } from '@/types/user.types';

// 4. Internal — lib/hooks/services/stores
import { userService } from '@/services/userService';
import { useUsers } from '@/hooks/useUsers';

// 5. Internal — components
import { DataTable } from '@/components/ui/DataTable';

// 6. Styles (last, if any)
```

## New Feature Development Workflow

1. Define the domain type in `types/<domain>.types.ts`
2. Write the Zod schema in `schemas/<domain>.schema.ts`
3. Write the API function in `services/<domain>Service.ts`
4. Add query keys to `constants/queryKeys.ts`
5. Create the TanStack Query hook in `hooks/use<Domain>.ts`
6. Build the UI component under `components/features/<domain>/`
7. Add the page at `app/(dashboard)/<route>/page.tsx`
8. Apply route guard and RBAC checks
9. Verify loading, empty, error states and toast notifications

## Error Handling Hierarchy

```
API Error
  └── Axios interceptor catches → normalizeError()
        └── TanStack Query onError → toast.error()
              └── React ErrorBoundary (render errors)
                    └── Sentry.captureException()
```

- Every `catch` block must either re-throw or handle the error. Silent catches are forbidden.
- Never swallow errors with empty `catch {}`.

## Absolute Prohibitions

- Using `any` type
- Fetching data inside `useEffect`
- Writing component styles with global CSS (use Tailwind classes)
- Storing auth tokens in `localStorage`
- Committing `console.log` / `console.error` / `debugger` statements
- Writing business logic inline in components (move to service/hook)
- Using `!important` in styles
- Using relative paths deeper than 1 level (`../../..`)
- Adding `// eslint-disable` comments without a documented, justified reason
- Empty `catch {}` blocks
- Hardcoded strings that should be constants