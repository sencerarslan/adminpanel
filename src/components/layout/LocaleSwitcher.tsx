'use client';

import { useTransition, useOptimistic } from 'react';
import { useLocale } from 'next-intl';
import { ChevronDown, Check } from 'lucide-react';
import { setLocale } from '@/lib/locale';
import { type Locale, locales } from '@/i18n/config';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const LOCALE_META: Record<Locale, { flag: string; shortLabel: string; fullLabel: string }> = {
    tr: { flag: '🇹🇷', shortLabel: 'TR', fullLabel: 'Türkçe' },
    en: { flag: '🇬🇧', shortLabel: 'EN', fullLabel: 'English' },
    de: { flag: '🇩🇪', shortLabel: 'DE', fullLabel: 'Deutsch' },
};

export function LocaleSwitcher(): React.JSX.Element {
    const currentLocale = useLocale() as Locale;
    const [isPending, startTransition] = useTransition();
    const [optimisticLocale, setOptimisticLocale] = useOptimistic(currentLocale);

    const handleChange = (locale: Locale): void => {
        if (locale === optimisticLocale) return;
        startTransition(async () => {
            setOptimisticLocale(locale);
            await setLocale(locale);
        });
    };

    const activeMeta = LOCALE_META[optimisticLocale];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    aria-label="Dil seçimi"
                    className={cn(
                        'h-9 gap-1.5 px-2.5 text-xs font-semibold',
                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isPending && 'opacity-60',
                    )}
                >
                    <span aria-hidden="true" className="text-sm leading-none">{activeMeta.flag}</span>
                    <span>{activeMeta.shortLabel}</span>
                    <ChevronDown
                        className={cn(
                            'h-3 w-3 text-muted-foreground transition-transform duration-150',
                            '[data-state=open]:rotate-180',
                        )}
                        aria-hidden="true"
                    />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-[140px] p-1">
                {locales.map((locale) => {
                    const meta = LOCALE_META[locale];
                    const isActive = optimisticLocale === locale;

                    return (
                        <DropdownMenuItem
                            key={locale}
                            onClick={() => handleChange(locale)}
                            className={cn(
                                'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm',
                                isActive && 'bg-accent font-semibold text-accent-foreground',
                            )}
                        >
                            <span aria-hidden="true" className="text-base leading-none">{meta.flag}</span>
                            <span className="flex-1">{meta.fullLabel}</span>
                            {isActive && (
                                <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
