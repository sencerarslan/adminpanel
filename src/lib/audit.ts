import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AuditLogParams {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    request?: NextRequest;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
    await prisma.auditLog.create({
        data: {
            userId: params.userId,
            action: params.action,
            resource: params.resource,
            resourceId: params.resourceId,
            // Prisma JSON field requires casting
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            metadata: params.metadata as any,
            ip:
                params.request?.headers.get('x-forwarded-for') ??
                params.request?.headers.get('x-real-ip') ??
                null,
            userAgent: params.request?.headers.get('user-agent') ?? null,
        },
    });
}
