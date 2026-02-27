---
trigger: always_on
glob: ["**/*.ts", "**/*.tsx"]
description: Performance optimization rules for Next.js admin panel
---

# Performance Rules

## Code Splitting

- Heavy components (charts, rich-text editors, maps, PDF viewers) are always lazy-loaded with `next/dynamic`:

```ts
// ✅ Correct
const RevenueChart = dynamic(() => import('@/components/features/dashboard/RevenueChart'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false, // for DOM-dependent libraries
});

// ❌ Wrong — heavy library bundled with initial JS
import RevenueChart from '@/components/features/dashboard/RevenueChart';
```

- Route-level code splitting is automatic in Next.js App Router — do not fight it by importing across route boundaries.

## Next.js Asset Optimization

- **Images**: `next/image` is mandatory. The native `<img>` tag is forbidden.
  - Set `width` and `height` or use `fill` with a positional parent to prevent layout shift (CLS).
  - Use `priority` only on above-the-fold images (hero, logo).
- **Fonts**: `next/font` (Google or local) is mandatory. Importing fonts via a `<link>` tag or external CSS is forbidden.

## Memoization Policy

Premature memoization is banned. Apply only after profiling identifies a bottleneck:

| Hook | When to use |
|------|-------------|
| `React.memo` | Component re-renders with identical props at measurable cost |
| `useMemo` | Expensive computation (sorting/filtering large arrays, complex derivations) |
| `useCallback` | Stable function reference passed to a memoized child or used as a `useEffect` dep |

Do **not** wrap every function in `useCallback` or every value in `useMemo` by default — it adds overhead and obscures code intent.

## TanStack Query Caching

Tune cache settings to avoid redundant network requests:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min — don't re-fetch fresh data
      gcTime: 1000 * 60 * 30,     // 30 min — keep in cache
      retry: 1,                    // one retry on failure
      refetchOnWindowFocus: false, // prevent noisy refetches in admin context
    },
  },
});
```

## Bundle Analysis

- Run `@next/bundle-analyzer` before each significant release to catch unintended bundle growth.
- Import only what you need from large libraries (prefer named imports over namespace imports):

```ts
// ✅
import { format } from 'date-fns';

// ❌
import * as dateFns from 'date-fns';
```

- Avoid adding a new npm package if the same result can be achieved with:
  - Native browser/Node APIs
  - A utility already in the project
  - A small self-written helper

## Server Components

- Prefer React Server Components (RSC) for data display pages — they ship zero JS for the component itself.
- Use `'use client'` only at the closest boundary where interactivity is needed (event handlers, hooks, browser APIs).
- Never add `'use client'` at the top of layout or page files that don't need it.

## Rendering Strategy

| Page type | Strategy |
|-----------|----------|
| Dashboard metrics | SSR with short `revalidate` (30–60s) |
| Static config pages | SSG or RSC with long cache |
| User-specific data tables | CSR via TanStack Query (requires auth) |
| Public pages (login) | SSG |
