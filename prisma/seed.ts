import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log('🌱 Seeding database...');

    // Create superadmin user
    const passwordHash = await bcrypt.hash('admin123', 12);

    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@adminpanel.com' },
        update: {},
        create: {
            name: 'Super Admin',
            email: 'admin@adminpanel.com',
            passwordHash,
            isSuperAdmin: true,
            isActive: true,
        },
    });

    console.log('✅ Created super admin:', superAdmin.email);

    // Create a regular editor user
    const editorHash = await bcrypt.hash('editor123', 12);

    const editor = await prisma.user.upsert({
        where: { email: 'editor@adminpanel.com' },
        update: {},
        create: {
            name: 'Editor Kullanıcı',
            email: 'editor@adminpanel.com',
            passwordHash: editorHash,
            isSuperAdmin: false,
            isActive: true,
        },
    });

    // Give editor view permissions on users and orders
    await prisma.pagePermission.upsert({
        where: { userId_pageKey: { userId: editor.id, pageKey: 'users' } },
        update: {},
        create: {
            userId: editor.id,
            pageKey: 'users',
            canView: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
        },
    });

    await prisma.pagePermission.upsert({
        where: { userId_pageKey: { userId: editor.id, pageKey: 'orders' } },
        update: {},
        create: {
            userId: editor.id,
            pageKey: 'orders',
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: false,
        },
    });

    console.log('✅ Created editor user:', editor.email);
    console.log('');
    console.log('🎉 Seeding complete!');
    console.log('');
    console.log('Login credentials:');
    console.log('  Super Admin → admin@adminpanel.com / admin123');
    console.log('  Editor      → editor@adminpanel.com / editor123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        void prisma.$disconnect();
    });
