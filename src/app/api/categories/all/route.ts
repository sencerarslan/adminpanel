import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
    const session = await validateSession(request);
    if (!session) return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });

    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: categories });
}
