import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';
import { createProductSchema } from '@/schemas/product.schema';

export async function GET(request: NextRequest): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    if (!requirePagePermission(session.user, PAGE_KEYS.PRODUCTS, 'canView')) {
        return NextResponse.json({ message: 'Bu sayfaya erişim yetkiniz yok' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';

    const where: any = {};
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (categoryId) {
        where.categories = { some: { id: categoryId } };
    }

    const [total, productsList] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: { createdAt: 'desc' },
            include: {
                categories: true,
            },
        }),
    ]);

    return NextResponse.json({
        data: productsList,
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
    if (!requirePagePermission(session.user, PAGE_KEYS.PRODUCTS, 'canCreate')) {
        return NextResponse.json({ message: 'Ürün ekleme yetkiniz yok' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const result = createProductSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ message: 'Geçersiz parametreler', errors: result.error.issues }, { status: 400 });
        }

        const data = result.data;

        const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
        if (existing) {
            return NextResponse.json({ message: 'Bu ürün kodu (SKU) zaten kullanılıyor' }, { status: 400 });
        }

        const { categoryIds, ...rest } = data;

        const newProduct = await prisma.product.create({
            data: {
                ...rest,
                categories: {
                    connect: categoryIds.map((id) => ({ id })),
                },
            },
            include: {
                categories: true,
            },
        });

        return NextResponse.json({ data: newProduct }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Ürün eklenirken bir hata oluştu' }, { status: 500 });
    }
}
