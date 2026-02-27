import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(): Promise<NextResponse> {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh_token')?.value;
        const userId = cookieStore.get('user_id')?.value;

        if (refreshToken) {
            await prisma.refreshToken
                .updateMany({
                    where: { token: refreshToken, revokedAt: null },
                    data: { revokedAt: new Date() },
                })
                .catch(() => {
                    // Token might not exist, ignore
                });
        }

        if (userId) {
            logger.info('User logged out', { userId });
        }

        // Clear all auth cookies
        cookieStore.delete('access_token');
        cookieStore.delete('refresh_token');
        cookieStore.delete('user_id');

        return NextResponse.json({ success: true, message: 'Çıkış yapıldı' });
    } catch (error) {
        logger.error('Logout error', { error });
        return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
    }
}
