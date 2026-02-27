import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    const { id } = await params;

    try {
        const session = await validateSession(request);
        if (!session) {
            return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
        }

        if (!requirePagePermission(session.user, PAGE_KEYS.USERS, 'canDelete')) {
            return NextResponse.json({ message: 'Silme yetkiniz yok' }, { status: 403 });
        }

        // Prevent deleting oneself
        if (session.user.id === id) {
            return NextResponse.json({ message: 'Kendi hesabınızı silemezsiniz' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id },
        });

        await logAudit({
            userId: session.user.id,
            action: 'delete',
            resource: 'users',
            resourceId: id,
            request,
        });

        return NextResponse.json({ success: true, message: 'Kullanıcı silindi' });
    } catch (error) {
        logger.error('Failed to delete user', { error, userId: id });
        return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
    }
}
