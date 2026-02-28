import type { Metadata } from 'next';
import { DashboardOverview } from '@/components/features/dashboard/DashboardOverview';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';

export const metadata: Metadata = {
    title: 'Dashboard — Admin Panel',
    description: 'Genel performans metrikleri, gelir analizi ve sipariş takibi.',
};

export default async function DashboardPage(): Promise<React.JSX.Element> {
    return (
        <div>
            <DashboardHeader />
            <DashboardOverview />
        </div>
    );
}
