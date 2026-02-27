import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(): Promise<NextResponse> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version ?? '0.1.0',
        });
    } catch (error) {
        logger.error('Health check failed', { error });
        return NextResponse.json({ status: 'error', db: 'unreachable' }, { status: 503 });
    }
}
