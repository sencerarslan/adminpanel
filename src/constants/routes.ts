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



    // Products
    PRODUCTS: '/products',
    PRODUCT_DETAIL: (id: string) => `/products/${id}`,

    // Categories
    CATEGORIES: '/categories',
    CATEGORY_DETAIL: (id: string) => `/categories/${id}`,

    // Reports
    REPORTS: '/reports',


} as const;
