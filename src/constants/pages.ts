export const PAGE_KEYS = {
    DASHBOARD: 'dashboard',
    USERS: 'users',
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    REPORTS: 'reports',
} as const;

export type PageKey = (typeof PAGE_KEYS)[keyof typeof PAGE_KEYS];
