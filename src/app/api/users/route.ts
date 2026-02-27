import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';
import bcrypt from 'bcryptjs';
import { createUserSchema } from '@/schemas/user.schema';

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await validateSession(request);
        if (!session) {
            return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
        }

        if (!requirePagePermission(session.user, PAGE_KEYS.USERS, 'canView')) {
            return NextResponse.json({ message: 'Bu sayfaya erişim yetkiniz yok' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const perPage = parseInt(searchParams.get('perPage') || '10', 10);
        const sort = searchParams.get('sort') || 'createdAt';
        const order = searchParams.get('order') || 'desc';

        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { [sort]: order },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    isSuperAdmin: true,
                    isActive: true,
                    createdAt: true,
                    permissions: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
            pagination: {
                page,
                perPage,
                total,
                totalPages: Math.ceil(total / perPage),
            },
            message: 'Kullanıcılar başarıyla getirildi',
        });
    } catch (error) {
        logger.error('Failed to fetch users', { error });
        return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await validateSession(request);
        if (!session) {
            return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
        }

        if (!requirePagePermission(session.user, PAGE_KEYS.USERS, 'canCreate')) {
            return NextResponse.json({ message: 'Kullanıcı oluşturma yetkiniz yok' }, { status: 403 });
        }

        const body: unknown = await request.json();
        const parsed = createUserSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ message: 'Geçersiz veri' }, { status: 400 });
        }

        const { name, email, password, isSuperAdmin } = parsed.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: 'Bu e-posta adresi zaten kullanımda' }, { status: 400 });
        }

        // Only existing Super Admins can create new Super Admins
        if (isSuperAdmin && !session.user.isSuperAdmin) {
            return NextResponse.json({ message: 'Süper admin yetkisi veremezsiniz' }, { status: 403 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                isSuperAdmin,
            },
        });

        await logAudit({
            userId: session.user.id,
            action: 'create',
            resource: 'users',
            resourceId: newUser.id,
            request,
        });

        return NextResponse.json(
            { success: true, message: 'Kullanıcı başarıyla oluşturuldu' },
            { status: 201 }
        );
    } catch (error) {
        logger.error('Failed to create user', { error });
        return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
    }
}
