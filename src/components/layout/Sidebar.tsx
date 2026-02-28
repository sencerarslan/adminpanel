'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
    LayoutDashboard,
    Users,
    Package,
    Tags,
    BarChart3,
    ChevronLeft,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { PAGE_KEYS, type PageKey } from '@/constants/pages';

interface NavItem {
    href: string;
    icon: React.ElementType;
    labelKey: string;
    pageKey?: PageKey;
}

const navItems: NavItem[] = [
    { href: ROUTES.DASHBOARD, icon: LayoutDashboard, labelKey: 'dashboard' },
    { href: ROUTES.USERS, icon: Users, labelKey: 'users', pageKey: PAGE_KEYS.USERS },
    { href: ROUTES.PRODUCTS, icon: Package, labelKey: 'products', pageKey: PAGE_KEYS.PRODUCTS },
    { href: ROUTES.CATEGORIES, icon: Tags, labelKey: 'categories', pageKey: PAGE_KEYS.CATEGORIES },
    { href: ROUTES.REPORTS, icon: BarChart3, labelKey: 'reports', pageKey: PAGE_KEYS.REPORTS },
];

export function Sidebar(): React.JSX.Element {
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const { getPagePermission } = useAuthStore();
    const pathname = usePathname();
    const t = useTranslations('navigation');

    const filteredNavItems = navItems.filter((item) => {
        if (!item.pageKey) return true;
        const perm = getPagePermission(item.pageKey);
        return perm?.canView;
    });

    return (
        <aside
            className={cn(
                'relative flex flex-col border-r border-border bg-card transition-all duration-300',
                sidebarOpen ? 'w-64' : 'w-16',
            )}
            aria-label={t('mainNavigation' as any)}
        >
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border px-4">
                <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                        <Shield className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
                    </div>
                    {sidebarOpen && (
                        <span className="font-semibold tracking-tight text-foreground">Admin Panel</span>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4" aria-label={t('mainMenu' as any)}>
                <ul className="space-y-1 px-2" role="list">
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            item.href === ROUTES.DASHBOARD
                                ? pathname === item.href
                                : pathname.startsWith(item.href);

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        'hover:bg-accent hover:text-accent-foreground',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                        isActive
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                                            : 'text-muted-foreground',
                                    )}
                                    aria-current={isActive ? 'page' : undefined}
                                    title={!sidebarOpen ? t(item.labelKey as Parameters<typeof t>[0]) : undefined}
                                >
                                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    {sidebarOpen && <span>{t(item.labelKey as Parameters<typeof t>[0])}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Toggle button */}
            <button
                onClick={toggleSidebar}
                className={cn(
                    'absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm',
                    'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'transition-transform',
                )}
                aria-label={sidebarOpen ? t('closeSidebar' as any) : t('openSidebar' as any)}
            >
                <ChevronLeft
                    className={cn('h-3 w-3 transition-transform', !sidebarOpen && 'rotate-180')}
                    aria-hidden="true"
                />
            </button>
        </aside>
    );
}
