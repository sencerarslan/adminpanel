import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body: unknown = await request.json();
        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ message: 'Geçersiz istek' }, { status: 400 });
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email, isActive: true },
            include: { permissions: true },
        });

        if (!user) {
            return NextResponse.json({ message: 'E-posta veya şifre hatalı' }, { status: 401 });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip');
            logger.warn('Failed login attempt', { email, ip });
            return NextResponse.json({ message: 'E-posta veya şifre hatalı' }, { status: 401 });
        }

        const jwtSecret = process.env.JWT_SECRET ?? 'fallback-secret';
        const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
        const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

        const accessToken = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
            expiresIn: accessExpiresIn,
        } as jwt.SignOptions);

        const refreshToken = jwt.sign({ userId: user.id }, jwtSecret, {
            expiresIn: refreshExpiresIn,
        } as jwt.SignOptions);

        // Store refresh token in DB
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        const cookieStore = await cookies();

        cookieStore.set('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60,
            path: '/',
        });

        cookieStore.set('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        // Store userId for session validation
        cookieStore.set('user_id', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        logger.info('User logged in', { userId: user.id });

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    isSuperAdmin: user.isSuperAdmin,
                    permissions: user.permissions.map((p: { pageKey: string; canView: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean }) => ({
                        pageKey: p.pageKey,
                        canView: p.canView,
                        canCreate: p.canCreate,
                        canUpdate: p.canUpdate,
                        canDelete: p.canDelete,
                    })),
                },
            },
            message: 'Giriş başarılı',
        });
    } catch (error) {
        logger.error('Login error', { error });
        return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
    }
}
