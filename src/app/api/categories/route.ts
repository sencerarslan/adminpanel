import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';
import { createCategorySchema } from '@/schemas/product.schema';

export async function GET(request: NextRequest): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    if (!requirePagePermission(session.user, PAGE_KEYS.CATEGORIES, 'canView')) {
        return NextResponse.json({ message: 'Bu sayfaya erişim yetkiniz yok' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [total, categoriesList] = await Promise.all([
        prisma.category.count({ where }),
        prisma.category.findMany({
            where,
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    return NextResponse.json({
        data: categoriesList,
        pagination: {
            page,
            perPage,
            total,
            totalPages: Math.ceil(total / perPage),
        },
    });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    if (!requirePagePermission(session.user, PAGE_KEYS.CATEGORIES, 'canCreate')) {
        return NextResponse.json({ message: 'Kategori ekleme yetkiniz yok' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const result = createCategorySchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ message: 'Geçersiz parametreler', errors: result.error.issues }, { status: 400 });
        }

        const data = result.data;

        const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
        if (existing) {
            return NextResponse.json({ message: 'Bu slug zaten kullanılıyor' }, { status: 400 });
        }

        const newCategory = await prisma.category.create({
            data,
        });

        return NextResponse.json({ data: newCategory }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Kategori eklenirken bir hata oluştu' }, { status: 500 });
    }
}
