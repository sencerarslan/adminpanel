export const PAGE_KEYS = {
    DASHBOARD: 'dashboard',
    USERS: 'users',
    ORDERS: 'orders',
    PRODUCTS: 'products',
    REPORTS: 'reports',
    SETTINGS: 'settings',
} as const;

export type PageKey = (typeof PAGE_KEYS)[keyof typeof PAGE_KEYS];
