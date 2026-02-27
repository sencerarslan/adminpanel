import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DashboardOverview } from '@/components/features/dashboard/DashboardOverview';

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default async function DashboardPage(): Promise<React.JSX.Element> {
    const t = await getTranslations('dashboard');

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold tracking-tight">{t('title')}</h1>
            <DashboardOverview />
        </div>
    );
}
