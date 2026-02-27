import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';
import { updateUserPermissionsSchema } from '@/schemas/user.schema';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;

        const session = await validateSession(request);
        if (!session) {
            return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
        }

        // Checking if the editor has UPDATE permission on users.
        if (!requirePagePermission(session.user, PAGE_KEYS.USERS, 'canUpdate')) {
            return NextResponse.json({ message: 'Kullanıcı düzenleme yetkiniz yok' }, { status: 403 });
        }

        const body: unknown = await request.json();
        const parsed = updateUserPermissionsSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ message: 'Geçersiz veri' }, { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        if (targetUser.isSuperAdmin && !session.user.isSuperAdmin) {
            return NextResponse.json({ message: 'Süper admin yetkilerini düzenleyemezsiniz' }, { status: 403 });
        }

        const { permissions } = parsed.data;

        // We do a transaction to clear existing permissions and insert new ones.
        await prisma.$transaction(async (tx) => {
            await tx.pagePermission.deleteMany({
                where: { userId: id },
            });

            if (permissions.length > 0) {
                await tx.pagePermission.createMany({
                    data: permissions.map((p) => ({
                        userId: id,
                        pageKey: p.pageKey,
                        canView: p.canView,
                        canCreate: p.canCreate,
                        canUpdate: p.canUpdate,
                        canDelete: p.canDelete,
                    })),
                });
            }
        });

        await logAudit({
            userId: session.user.id,
            action: 'update_permissions',
            resource: 'users',
            resourceId: id,
            request,
        });

        return NextResponse.json({ success: true, message: 'İzinler başarıyla güncellendi' });
    } catch (error) {
        logger.error('Failed to update permissions', { error });
        return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
    }
}
