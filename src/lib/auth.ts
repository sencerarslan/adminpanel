import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { AuthUser } from '@/types/auth.types';

export interface Session {
    user: AuthUser;
}

export async function validateSession(_request?: NextRequest): Promise<Session | null> {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;

        if (!userId) return null;

        const user = await prisma.user.findUnique({
            where: { id: userId, isActive: true },
            include: { permissions: true },
        });

        if (!user) return null;

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl ?? undefined,
                isSuperAdmin: user.isSuperAdmin,
                permissions: user.permissions.map((p) => ({
                    pageKey: p.pageKey,
                    canView: p.canView,
                    canCreate: p.canCreate,
                    canUpdate: p.canUpdate,
                    canDelete: p.canDelete,
                })),
            },
        };
    } catch {
        return null;
    }
}
