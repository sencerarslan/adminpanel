import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';

export async function POST(request: NextRequest): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    if (!requirePagePermission(session.user, PAGE_KEYS.CATEGORIES, 'canDelete')) {
        return NextResponse.json({ message: 'Kategori silme yetkiniz yok' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { ids } = body;

        console.log("ids", ids)

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ message: 'Lütfen silinecek kategorileri seçin' }, { status: 400 });
        }

        await prisma.category.deleteMany({
            where: {
                id: { in: ids },
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Kategoriler silinirken bir hata oluştu' }, { status: 500 });
    }
}
