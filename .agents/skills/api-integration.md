---
description: Patterns and best practices for integrating REST APIs in this project
---

# Skill: API Integration

Bu skill, backend API'siyle entegrasyon kurulurken izlenecek standartları tanımlar.

---

## Axios Instance (`lib/api.ts`)

Tüm HTTP istekleri tek bir Axios instance üzerinden geçer. Başka bir yerde `axios.create()` çağrılmaz.

```ts
// src/lib/api.ts
import axios, { type AxiosInstance } from 'axios';
import { normalizeError } from '@/lib/errors';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10_000,
});

// 401 yakalandığında token refresh + queue mekanizması
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);
```

## Error Normalization (`lib/errors.ts`)

```ts
// src/lib/errors.ts
import axios from 'axios';

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
  if (error instanceof Error) return { message: error.message };
  return { message: 'Beklenmeyen bir hata oluştu.' };
}
```

## Query Key Fabrikası

```ts
// src/constants/queryKeys.ts
export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (filters: UserFilters) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', id] as const,
  },
  products: {
    all: ['products'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', id] as const,
  },
} as const;
```

## Pagination Pattern

Server-side pagination için URL parametreleri:

```ts
// src/hooks/useUrlPagination.ts
import { useRouter, useSearchParams } from 'next/navigation';

export function useUrlPagination(defaultPerPage = 20) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get('page') ?? 1);
  const perPage = Number(searchParams.get('perPage') ?? defaultPerPage);

  const setPage = (newPage: number): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  return { page, perPage, setPage };
}
```

## File Upload Pattern

```ts
export const uploadService = {
  uploadFile: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
```

## API Tipleri

```ts
// src/types/api.types.ts
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}
```

## Kontrol Listesi

- [ ] `api.ts`'den import ediliyor (diğer axios instance'lar yok)
- [ ] Tüm response'lar typed
- [ ] Hata normalize edilmiş (`normalizeError`)
- [ ] Sayfalama URL ile senkronize
- [ ] Yükleme durumu gösteriliyor
