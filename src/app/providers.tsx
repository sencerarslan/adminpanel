'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster, toast } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { normalizeError } from '@/lib/errors';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            onError: (error) => {
                const normalized = normalizeError(error);
                toast.error(normalized.message);
                if (process.env.NODE_ENV === 'development') {
                    console.error('[Mutation Error]', normalized.message);
                }
            },
        },
    },
});

interface ProvidersProps {
    readonly children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps): React.JSX.Element {
    return (
        <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                    <Toaster position="bottom-right" richColors closeButton />
                </ThemeProvider>
            </NuqsAdapter>
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}
