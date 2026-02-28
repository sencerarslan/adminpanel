export const queryKeys = {
    auth: {
        me: ['auth', 'me'] as const,
    },
    users: {
        all: ['users'] as const,
        list: <T>(filters: T) => ['users', 'list', filters] as const,
        detail: (id: string) => ['users', id] as const,
    },
    orders: {
        all: ['orders'] as const,
        list: <T>(filters: T) => ['orders', 'list', filters] as const,
        detail: (id: string) => ['orders', id] as const,
    },
    products: {
        all: ['products'] as const,
        list: <T>(filters: T) => ['products', 'list', filters] as const,
        detail: (id: string) => ['products', id] as const,
    },
    categories: {
        all: ['categories'] as const,
        list: <T>(filters: T) => ['categories', 'list', filters] as const,
        detail: (id: string) => ['categories', id] as const,
    },
    reports: {
        all: ['reports'] as const,
        list: <T>(filters: T) => ['reports', 'list', filters] as const,
    },
    permissions: {
        all: ['permissions'] as const,
        user: (userId: string) => ['permissions', userId] as const,
    },
} as const;
