'use client';

import { create } from 'zustand';
import type { AuthUser, PagePermission } from '@/types/auth.types';
import type { PageKey } from '@/constants/pages';

interface AuthStore {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: AuthUser) => void;
    clearAuth: () => void;
    getPagePermission: (pageKey: PageKey) => PagePermission | null;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

    clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),

    getPagePermission: (pageKey) => {
        const { user } = get();
        if (!user) return null;
        if (user.isSuperAdmin) {
            return {
                pageKey,
                canView: true,
                canCreate: true,
                canUpdate: true,
                canDelete: true,
            };
        }
        return user.permissions.find((p) => p.pageKey === pageKey) ?? null;
    },
}));
