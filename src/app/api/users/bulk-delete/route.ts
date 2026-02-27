import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await validateSession(request);
        if (!session) {
            return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
        }

        if (!requirePagePermission(session.user, PAGE_KEYS.USERS, 'canDelete')) {
            return NextResponse.json({ message: 'Silme yetkiniz yok' }, { status: 403 });
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ message: 'Geçersiz parametreler' }, { status: 400 });
        }

        // Prevent deleting oneself
        const deletableIds = ids.filter((id: string) => id !== session.user.id);

        if (deletableIds.length === 0) {
            return NextResponse.json({ message: 'Kendi hesabınızı silemezsiniz' }, { status: 400 });
        }

        const result = await prisma.user.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        await logAudit({
            userId: session.user.id,
            action: 'bulk-delete',
            resource: 'users',
            metadata: { deletedCount: result.count, requestedIds: deletableIds },
            request,
        });

        return NextResponse.json({
            success: true,
            message: `${result.count} kullanıcı silindi`,
        });
    } catch (error) {
        logger.error('Failed to bulk delete users', { error });
        return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
    }
}
