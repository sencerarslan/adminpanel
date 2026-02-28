'use server';

import { cookies } from 'next/headers';
import { type Locale, locales } from '@/i18n/config';

export async function setLocale(locale: Locale): Promise<void> {
    if (!locales.includes(locale)) return;
    const cookieStore = await cookies();
    cookieStore.set('locale', locale, {
        httpOnly: false, // client'tan okunabilmeli (UI toggle için)
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 yıl
    });
}

export async function getLocaleFromCookie(): Promise<Locale> {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale')?.value;
    return locales.includes(localeCookie as Locale) ? (localeCookie as Locale) : 'tr';
}
