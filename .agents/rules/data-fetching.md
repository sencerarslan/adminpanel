---
trigger: always_on
glob: ["**/*.ts", "**/*.tsx"]
description: Server state, client state, API layer, optimistic updates, and data fetching patterns
---

# Data Fetching & State Rules

## Server State — TanStack Query

- **All remote data** is managed with TanStack Query (React Query v5). Fetching inside `useEffect` is strictly forbidden.
- Query keys are defined as typed constants in `constants/queryKeys.ts` to avoid typos and enable easy invalidation.

```ts
// constants/queryKeys.ts
export const queryKeys = {
  users: {
    all: ['users'] as const,
    list: (filters: UserFilters) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', id] as const,
  },
} as const;
```

- Every query hook lives in `hooks/` with the `use` prefix and is co-located with its service call:

```ts
// hooks/useUsers.ts
export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userService.getUsers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

- Mutations must include:
  - `onSuccess`: invalidate related queries + show success toast
  - `onError`: show human-readable error toast
  - Optimistic updates where appropriate (list reordering, status toggles)

## Optimistic Updates

For mutations where instant feedback matters (status toggles, reorders):

```ts
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      userService.updateStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });
      const previous = queryClient.getQueryData(queryKeys.users.all);

      queryClient.setQueryData(queryKeys.users.all, (old: User[] | undefined) =>
        old?.map((u) => (u.id === id ? { ...u, status } : u))
      );

      return { previous }; // rollback context
    },

    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.users.all, context.previous);
      }
      toast.error('Durum güncellenemedi');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
```

## Client State — Zustand

- Zustand is the sole client state solution. Redux and Context API are not used for new features.
- Each domain has its own slice in `store/<domain>Store.ts`. Avoid a single monolithic store.
- Store actions are co-located with state (not split into separate action files).

```ts
// store/uiStore.ts
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
```

- Zustand stores are never serialized to `localStorage` for auth-sensitive data.
- Use `devtools` middleware in development only:

```ts
export const useUIStore = create<UIStore>()(
  process.env.NODE_ENV === 'development'
    ? devtools((set) => ({ ... }), { name: 'UIStore' })
    : (set) => ({ ... })
);
```

## API Client — Axios

The Axios instance is configured once in `lib/api.ts` and imported everywhere:

```ts
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // for httpOnly cookies
  timeout: 10_000,
});

// Request interceptor — add auth header if needed
api.interceptors.request.use((config) => { ... });

// Response interceptor — normalize errors, handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // attempt token refresh, then redirect to login
    }
    return Promise.reject(normalizeError(error));
  }
);
```

## Service Layer

- API calls are never written directly in components or hooks.
- Each domain has its own service file: `services/userService.ts`, `services/orderService.ts`, etc.
- Service functions are pure async functions that return typed data:

```ts
// services/userService.ts
export const userService = {
  getUsers: async (filters: UserFilters): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get('/users', { params: filters });
    return data;
  },
  updateUser: async (id: string, payload: UpdateUserDto): Promise<User> => {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post('/users/bulk-delete', { ids });
  },
};
```

## QueryClient Configuration

Configure globally in the providers wrapper:

```ts
// app/providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 min
      gcTime: 1000 * 60 * 30,      // 30 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        toast.error(normalizeError(error).message);
      },
    },
  },
});
```

## Loading & Error States

- Every data-fetching operation shows a skeleton loader or spinner. Empty/blank screens are not acceptable.
- Use `<Skeleton>` from shadcn/ui for content placeholders; match the skeleton shape to the actual content layout.
- Error states must offer a retry action where applicable.

```tsx
function UserList(): React.JSX.Element {
  const { data, isLoading, isError, refetch } = useUsers({});

  if (isLoading) return <UserListSkeleton />;

  if (isError) {
    return (
      <ErrorState
        message="Kullanıcılar yüklenemedi"
        onRetry={refetch}
      />
    );
  }

  if (!data?.data.length) {
    return <EmptyState title="Henüz kullanıcı yok" />;
  }

  return <DataTable columns={userColumns} data={data.data} />;
}
```

## Environment Variables

- Public variables: `NEXT_PUBLIC_` prefix, used in client code.
- Secret variables: no prefix, used in Server Components / Route Handlers only.
- All variables must be documented in `.env.example` with placeholder values and comments.
