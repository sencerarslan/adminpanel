import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';
import { createProductSchema } from '@/schemas/product.schema';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } | { params: { id: string } }
): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });

    const resolvedParams = await Promise.resolve(params);

    const product = await prisma.product.findUnique({
        where: { id: resolvedParams.id },
        include: { categories: true },
    });

    if (!product) {
        return NextResponse.json({ message: 'Ürün bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ data: product });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } | { params: { id: string } }
): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    if (!requirePagePermission(session.user, PAGE_KEYS.PRODUCTS, 'canUpdate')) {
        return NextResponse.json({ message: 'Güncelleme yetkiniz yok' }, { status: 403 });
    }

    const resolvedParams = await Promise.resolve(params);

    try {
        const body = await request.json();
        const result = createProductSchema.partial().safeParse(body);
        if (!result.success) {
            return NextResponse.json({ message: 'Geçersiz parametreler' }, { status: 400 });
        }

        const data = result.data;
        const updateData: any = { ...data };

        if (data.sku) {
            const existing = await prisma.product.findFirst({
                where: { sku: data.sku, id: { not: resolvedParams.id } },
            });
            if (existing) {
                return NextResponse.json({ message: 'Bu ürün kodu (SKU) başka bir üründe kullanılıyor' }, { status: 400 });
            }
        }

        if (data.categoryIds) {
            updateData.categories = {
                set: data.categoryIds.map((id) => ({ id })),
            };
            delete updateData.categoryIds;
        }

        const updated = await prisma.product.update({
            where: { id: resolvedParams.id },
            data: updateData,
            include: { categories: true },
        });

        return NextResponse.json({ data: updated });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Hata oluştu' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } | { params: { id: string } }
): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    if (!requirePagePermission(session.user, PAGE_KEYS.PRODUCTS, 'canDelete')) {
        return NextResponse.json({ message: 'Silme yetkiniz yok' }, { status: 403 });
    }

    const resolvedParams = await Promise.resolve(params);

    try {
        await prisma.product.delete({ where: { id: resolvedParams.id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ message: 'Silme hatası' }, { status: 500 });
    }
}
