import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';
import { AccessDenied } from '@/components/ui/AccessDenied';

export const metadata: Metadata = {
    title: 'Siparişler',
};

export default async function OrdersPage(): Promise<React.JSX.Element> {
    const session = await validateSession();
    if (!session || !requirePagePermission(session.user, PAGE_KEYS.ORDERS, 'canView')) {
        return <AccessDenied />;
    }

    const t = await getTranslations('orders');

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">Sipariş yönetimi yakında eklenecek.</p>
        </div>
    );
}
