import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { validateSession } from '@/lib/auth';
import { AuthProvider } from '@/components/providers/AuthProvider';

interface DashboardLayoutProps {
    readonly children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps): Promise<React.JSX.Element> {
    const session = await validateSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <AuthProvider user={session.user}>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header />
                    <main id="main-content" className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}
