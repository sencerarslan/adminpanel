---
description: Testing strategy, tools, and patterns for the admin panel
---

# Skill: Testing

Bu skill, projedeki test stratejisini, araç seçimini ve yazım kalıplarını tanımlar.

---

## Test Araçları

| Araç | Amaç |
|------|-------|
| **Vitest** | Unit ve integration testler |
| **React Testing Library** | Component testleri |
| **Playwright** | E2E testler |
| **MSW (Mock Service Worker)** | API mock'lama |

## Kurulum

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
pnpm add -D @playwright/test msw
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
});
```

## Test Dosya Yapısı

```
src/
  tests/
    setup.ts             # Global test setup
    mocks/
      handlers.ts        # MSW request handlers
      server.ts          # MSW server
  components/features/
    users/
      UserTable.test.tsx # Bileşen testleri bileşenin yanında
  hooks/
    useUsers.test.ts
  services/
    userService.test.ts
e2e/
  auth.spec.ts
  users.spec.ts
```

## Component Test Kalıbı

```tsx
// UserTable.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserTable } from './UserTable';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe('UserTable', () => {
  it('kullanıcıları liste olarak gösterir', async () => {
    render(<UserTable />, { wrapper: createWrapper() });
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });

  it('arama kutusuna yazınca filtreler', async () => {
    const user = userEvent.setup();
    render(<UserTable />, { wrapper: createWrapper() });
    await user.type(screen.getByPlaceholderText('Ara...'), 'Jane');
    expect(await screen.findByText('Jane Smith')).toBeInTheDocument();
  });
});
```

## MSW (API Mock)

```ts
// src/tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import type { User } from '@/types/user.types';

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', createdAt: '2024-01-01' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'editor', createdAt: '2024-01-02' },
];

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json({
      data: mockUsers,
      pagination: { page: 1, perPage: 20, total: 2, totalPages: 1 },
    });
  }),
  http.delete('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ success: true });
  }),
];
```

## Hook Test Kalıbı

```ts
// useUsers.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from './useUsers';
import { createWrapper } from '@/tests/utils';

describe('useUsers', () => {
  it('kullanıcıları çeker', async () => {
    const { result } = renderHook(() => useUsers({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(2);
  });
});
```

## E2E (Playwright)

```ts
// e2e/users.spec.ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'secret');
  await page.click('[type="submit"]');
  await page.waitForURL('/dashboard');
});

test('kullanıcı listesi yüklenir', async ({ page }) => {
  await page.goto('/users');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('John Doe')).toBeVisible();
});

test('yeni kullanıcı oluşturulur', async ({ page }) => {
  await page.goto('/users');
  await page.click('text=Yeni Kullanıcı');
  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[type="submit"]');
  await expect(page.getByText('Kullanıcı başarıyla oluşturuldu')).toBeVisible();
});
```

## Çalıştırma Komutları

```bash
# Unit/Integration testler
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage

# E2E
pnpm playwright test
pnpm playwright test --ui  # görsel arayüz
```

## Test Önceliklendirmesi

1. **Kritik iş akışları** (auth, CRUD işlemleri) — E2E ile kapsanır
2. **Custom hook'lar** — unit testleri yazılır
3. **Karmaşık bileşen mantığı** — RTL ile test edilir
4. **Servis fonksiyonları** — MSW ile integration testi
5. **Utility fonksiyonlar** — Saf unit testler

## Kapsam Hedefi

| Ölçüm | Hedef |
|-------|-------|
| Kritik path coverage | %90+ |
| Genel branch coverage | %70+ |
| E2E — main flows | %100 |
