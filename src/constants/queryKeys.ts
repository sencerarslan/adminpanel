export const queryKeys = {
    auth: {
        me: ['auth', 'me'] as const,
    },
    users: {
        all: ['users'] as const,
        list: (filters: Record<string, unknown>) => ['users', 'list', filters] as const,
        detail: (id: string) => ['users', id] as const,
    },
    orders: {
        all: ['orders'] as const,
        list: (filters: Record<string, unknown>) => ['orders', 'list', filters] as const,
        detail: (id: string) => ['orders', id] as const,
    },
    products: {
        all: ['products'] as const,
        list: (filters: Record<string, unknown>) => ['products', 'list', filters] as const,
        detail: (id: string) => ['products', id] as const,
    },
    reports: {
        all: ['reports'] as const,
        list: (filters: Record<string, unknown>) => ['reports', 'list', filters] as const,
    },
    permissions: {
        all: ['permissions'] as const,
        user: (userId: string) => ['permissions', userId] as const,
    },
} as const;
