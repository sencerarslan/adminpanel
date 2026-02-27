'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import type { LoginResponse } from '@/types/auth.types';

const loginSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(1, 'Şifre zorunludur'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm(): React.JSX.Element {
    const t = useTranslations('auth');
    const router = useRouter();
    const searchParams = useSearchParams();
    const setUser = useAuthStore((s) => s.setUser);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form;

    const onSubmit = async (values: LoginFormValues): Promise<void> => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const data = (await response.json()) as { success: boolean; data?: LoginResponse; message?: string };

            if (!response.ok || !data.success || !data.data) {
                toast.error(data.message ?? t('loginError'));
                return;
            }

            setUser(data.data.user);

            const callbackUrl = searchParams.get('callbackUrl');
            const safePath =
                callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
                    ? callbackUrl
                    : ROUTES.DASHBOARD;

            router.push(safePath);
        } catch {
            toast.error('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
                        <Shield className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">{t('loginTitle')}</h1>
                        <p className="mt-1 text-sm text-slate-400">{t('loginSubtitle')}</p>
                    </div>
                </div>

                <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4" noValidate>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                            {t('email')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder={t('emailPlaceholder')}
                            className={cn(
                                'w-full rounded-lg border bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                'transition-colors',
                                errors.email
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-white/10 hover:border-white/20',
                            )}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            aria-invalid={errors.email ? 'true' : undefined}
                            {...register('email')}
                        />
                        {errors.email && (
                            <p id="email-error" className="mt-1 text-xs text-red-400" role="alert">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                            {t('password')}
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder={t('passwordPlaceholder')}
                            className={cn(
                                'w-full rounded-lg border bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                'transition-colors',
                                errors.password
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-white/10 hover:border-white/20',
                            )}
                            aria-describedby={errors.password ? 'password-error' : undefined}
                            aria-invalid={errors.password ? 'true' : undefined}
                            {...register('password')}
                        />
                        {errors.password && (
                            <p id="password-error" className="mt-1 text-xs text-red-400" role="alert">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            'w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground',
                            'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            'transition-colors disabled:pointer-events-none disabled:opacity-60',
                            'flex items-center justify-center gap-2',
                        )}
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                        {t('loginButton')}
                    </button>
                </form>

                {/* Forgot password */}
                <div className="mt-4 text-center">
                    <a
                        href={ROUTES.FORGOT_PASSWORD}
                        className="text-sm text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    >
                        {t('forgotPassword')}
                    </a>
                </div>
            </div>
        </div>
    );
}
