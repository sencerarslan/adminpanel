import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';
import { createCategorySchema } from '@/schemas/product.schema';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    if (!requirePagePermission(session.user, PAGE_KEYS.CATEGORIES, 'canView')) {
        return NextResponse.json({ message: 'Bu sayfaya erişim yetkiniz yok' }, { status: 403 });
    }

    const { id } = await params;
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        return NextResponse.json({ message: 'Kategori bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ data: category });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    if (!requirePagePermission(session.user, PAGE_KEYS.CATEGORIES, 'canUpdate')) {
        return NextResponse.json({ message: 'Kategori düzenleme yetkiniz yok' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await request.json();

        const result = createCategorySchema.partial().safeParse(body);
        if (!result.success) {
            return NextResponse.json({ message: 'Geçersiz parametreler', errors: result.error.issues }, { status: 400 });
        }

        const data = result.data;
        if (data.slug) {
            const existing = await prisma.category.findFirst({
                where: { slug: data.slug, id: { not: id } }
            });
            if (existing) {
                return NextResponse.json({ message: 'Bu slug başka bir kategori tarafından kullanılıyor' }, { status: 400 });
            }
        }

        const category = await prisma.category.update({
            where: { id },
            data,
        });

        return NextResponse.json({ data: category });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Bir hata oluştu' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    if (!requirePagePermission(session.user, PAGE_KEYS.CATEGORIES, 'canDelete')) {
        return NextResponse.json({ message: 'Kategori silme yetkiniz yok' }, { status: 403 });
    }

    try {
        const { id } = await params;
        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Bir hata oluştu' }, { status: 500 });
    }
}
