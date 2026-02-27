import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Giriş Yap',
};

interface AuthLayoutProps {
    readonly children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {children}
        </div>
    );
}
