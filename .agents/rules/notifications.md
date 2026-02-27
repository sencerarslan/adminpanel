---
trigger: always_on
glob: ["**/*.tsx", "**/*.ts"]
description: Toast notifications, error boundaries, and user feedback patterns
---

# Notifications & Error Handling Rules

## Toast Library

**sonner** is the project-wide toast library. No other toast/notification library is added.

The `<Toaster>` component is mounted once in the root layout:

```tsx
// app/layout.tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
```

## Standard Toast Functions

| Scenario | Function | Example |
|----------|----------|---------|
| Successful action | `toast.success()` | `toast.success('Kullanıcı oluşturuldu')` |
| API / runtime error | `toast.error()` | `toast.error('Kayıt silinemedi')` |
| Informational | `toast.info()` | `toast.info('Değişiklikler kaydedildi')` |
| Caution / warning | `toast.warning()` | `toast.warning('Bu işlem geri alınamaz')` |
| In-progress action | `toast.promise()` | Wraps async mutation with pending/success/error |

## toast.promise Pattern

For long-running mutations, use `toast.promise` instead of separate success/error calls:

```ts
toast.promise(
  updateUser(id, payload),
  {
    loading: 'Kullanıcı güncelleniyor…',
    success: 'Kullanıcı başarıyla güncellendi',
    error: (err) => err.message ?? 'Bir hata oluştu',
  }
);
```

## Message Guidelines

- Messages are written in **Turkish** (matching the project UI language).
- **Never expose raw error messages or stack traces** to the user. Show a friendly, human-readable message.
- Error messages from API: use `err.response.data.message` if it is user-safe; otherwise fallback to a generic Turkish message.
- Keep toast messages concise — one clear sentence. Details go in a follow-up `description` prop if needed.

## Error Normalization

A shared `normalizeError()` utility in `lib/errors.ts` converts any thrown value into a structured error object:

```ts
// lib/errors.ts
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
}

export function normalizeError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message ?? 'Bir hata oluştu.',
      statusCode: error.response?.status,
      code: error.response?.data?.code,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'Beklenmeyen bir hata oluştu.' };
}
```

## Error Boundaries

- A top-level `ErrorBoundary` component wraps the dashboard layout to catch unhandled render errors.
- Feature-level error boundaries wrap complex widgets (charts, rich editors) so isolated crashes don't bring down the whole page.
- The fallback UI includes: a friendly error message, a "Yeniden Dene" (retry) button, and optionally a "Sayfayı Yenile" button.

```tsx
// Using react-error-boundary
<ErrorBoundary
  fallbackRender={({ resetErrorBoundary }) => (
    <ErrorFallback onRetry={resetErrorBoundary} />
  )}
>
  <RevenueChart />
</ErrorBoundary>
```

## Confirmation Dialogs

- Destructive actions (delete, bulk delete, revoke access) always show a shadcn `AlertDialog` confirmation before executing.
- The confirm button is styled with `variant="destructive"` and is **not** the default-focused element (to prevent accidental keyboard confirmation).
