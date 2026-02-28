import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { validateSession } from '@/lib/auth';
import { requirePagePermission } from '@/lib/rbac';
import { PAGE_KEYS } from '@/constants/pages';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { ReportsOverview } from '@/components/features/reports/ReportsOverview';

export const metadata: Metadata = {
    title: 'Raporlar',
};

export default async function ReportsPage(): Promise<React.JSX.Element> {
    const session = await validateSession();
    if (!session || !requirePagePermission(session.user, PAGE_KEYS.REPORTS, 'canView')) {
        return <AccessDenied />;
    }

    const t = await getTranslations('reports');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
            <ReportsOverview />
        </div>
    );
}
