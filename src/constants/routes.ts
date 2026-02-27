export const ROUTES = {
    // Public
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',

    // Dashboard
    DASHBOARD: '/dashboard',

    // Users
    USERS: '/users',
    USER_DETAIL: (id: string) => `/users/${id}`,

    // Orders
    ORDERS: '/orders',
    ORDER_DETAIL: (id: string) => `/orders/${id}`,

    // Products
    PRODUCTS: '/products',
    PRODUCT_DETAIL: (id: string) => `/products/${id}`,

    // Reports
    REPORTS: '/reports',

    // Settings
    SETTINGS: '/settings',
    SETTINGS_PERMISSIONS: '/settings/permissions',
    SETTINGS_PROFILE: '/settings/profile',
} as const;
