'use client';

import { useTranslations } from 'next-intl';
import { Users, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCard {
    labelKey: string;
    value: string;
    change: string;
    icon: React.ElementType;
    trend: 'up' | 'down';
}

const stats: StatCard[] = [
    { labelKey: 'totalUsers', value: '2,847', change: '+12%', icon: Users, trend: 'up' },
    { labelKey: 'totalOrders', value: '18,492', change: '+8%', icon: ShoppingCart, trend: 'up' },
    { labelKey: 'totalProducts', value: '1,204', change: '-2%', icon: Package, trend: 'down' },
    { labelKey: 'totalRevenue', value: '₺1.2M', change: '+23%', icon: TrendingUp, trend: 'up' },
];

export function DashboardOverview(): React.JSX.Element {
    const t = useTranslations('dashboard');

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.labelKey}
                        className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                                aria-hidden="true"
                            >
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <span
                                className={cn(
                                    'text-xs font-medium',
                                    stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500',
                                )}
                            >
                                {stat.change}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(stat.labelKey as Parameters<typeof t>[0])}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
