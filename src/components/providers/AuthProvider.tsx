'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@/types/auth.types';

interface AuthProviderProps {
    user: AuthUser;
    children: React.ReactNode;
}

export function AuthProvider({ user, children }: AuthProviderProps) {
    const setUser = useAuthStore((state) => state.setUser);

    // Hydrate store synchronously before children render
    if (!useAuthStore.getState().user || useAuthStore.getState().user?.id !== user.id) {
        useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
    }

    React.useEffect(() => {
        setUser(user);
    }, [user, setUser]);

    return <>{children}</>;
}
