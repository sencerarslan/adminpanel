import { getTranslations } from 'next-intl/server';
import { UserTable } from '@/components/features/users/UserTable';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';
import { AccessDenied } from '@/components/ui/AccessDenied';

export const metadata = {
    title: 'Kullanıcılar',
};

export default async function UsersPage(): Promise<React.JSX.Element> {
    const session = await validateSession();
    if (!session || !requirePagePermission(session.user, PAGE_KEYS.USERS, 'canView')) {
        return <AccessDenied />;
    }

    const t = await getTranslations('users');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">Sistemdeki tüm kullanıcıları ve yetkilerini yönetin.</p>
            </div>

            <UserTable />
        </div>
    );
}
