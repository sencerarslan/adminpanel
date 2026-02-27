import type { AuthUser } from '@/types/auth.types';
import type { PageKey } from '@/constants/pages';

type PermissionAction = 'canView' | 'canCreate' | 'canUpdate' | 'canDelete';

export function requirePagePermission(
    user: AuthUser,
    pageKey: PageKey,
    action: PermissionAction,
): boolean {
    if (user.isSuperAdmin) return true;
    const perm = user.permissions.find((p) => p.pageKey === pageKey);
    return perm?.[action] ?? false;
}
