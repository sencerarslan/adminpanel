'use client';

import { useTranslations } from 'next-intl';
import { Moon, Sun, Bell, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';

export function Header(): React.JSX.Element {
    const { setTheme, theme } = useTheme();
    const { user } = useAuthStore();
    const t = useTranslations('auth');
    const tCommon = useTranslations('common');
    const tNav = useTranslations('navigation');

    const handleLogout = async (): Promise<void> => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch {
            window.location.href = '/login';
        }
    };

    const toggleTheme = (): void => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
            {/* Skip to content link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
            >
                {tCommon('skipToContent')}
            </a>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
                {/* Notifications */}
                <button
                    className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    )}
                    aria-label="Notifications"
                >
                    <Bell className="h-4 w-4" aria-hidden="true" />
                </button>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    )}
                    aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                >
                    {theme === 'dark' ? (
                        <Sun className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <Moon className="h-4 w-4" aria-hidden="true" />
                    )}
                </button>

                {/* Locale Switcher */}
                <LocaleSwitcher />

                {/* User info */}
                {user && (
                    <div className="flex items-center gap-3 pl-2">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                            aria-hidden="true"
                        >
                            {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={() => void handleLogout()}
                    className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground',
                        'hover:bg-destructive/10 hover:text-destructive',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    )}
                    aria-label={t('logout')}
                >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </header>
    );
}
