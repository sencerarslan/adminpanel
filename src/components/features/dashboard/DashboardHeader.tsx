'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Download } from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

function getGreetingKey(hour: number): 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' {
    if (hour < 12) return 'greetingMorning';
    if (hour < 18) return 'greetingAfternoon';
    return 'greetingEvening';
}

export function DashboardHeader(): React.JSX.Element {
    const t = useTranslations('dashboard');
    const tNav = useTranslations('common');
    const format = useFormatter();
    const user = useAuthStore((s) => s.user);
    const [now, setNow] = useState<Date | null>(null);

    // Avoid hydration mismatch by setting date client-side only
    useEffect(() => {
        setNow(new Date());
        const interval = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(interval);
    }, []);

    const greetingKey = now ? getGreetingKey(now.getHours()) : 'greetingMorning';
    const greeting = t(greetingKey);
    const firstName = user?.name?.split(' ')[0] ?? 'Admin';

    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: greeting */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {greeting}, {firstName} 👋
                </h1>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {now ? (
                        <span suppressHydrationWarning>
                            {format.dateTime(now, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    ) : (
                        <span className="h-4 w-48 animate-pulse rounded bg-muted" />
                    )}
                </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" type="button">
                    <Download className="mr-2 h-4 w-4" />
                    {t('reportDownload')}
                </Button>
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{tNav('live')}</span>
                </div>
            </div>
        </div>
    );
}
