'use client';

import { useAuthStore } from '@/store/authStore';
import type { PageKey } from '@/constants/pages';

export interface UsePagePermissionReturn {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    isLoading: boolean;
}

export function usePagePermission(pageKey: PageKey): UsePagePermissionReturn {
    const { getPagePermission, isLoading } = useAuthStore();
    const perm = getPagePermission(pageKey);

    return {
        canView: perm?.canView ?? false,
        canCreate: perm?.canCreate ?? false,
        canUpdate: perm?.canUpdate ?? false,
        canDelete: perm?.canDelete ?? false,
        isLoading,
    };
}
