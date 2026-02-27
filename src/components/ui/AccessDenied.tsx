import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export function AccessDenied(): React.JSX.Element {
    return (
        <div className="mx-auto flex h-[60vh] max-w-sm flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center justify-center rounded-full bg-destructive/10 p-6 text-destructive">
                <ShieldAlert className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Erişim Reddedildi</h2>
            <p className="max-w-md text-muted-foreground text-sm">
                Bu sayfayı görüntüleme yetkiniz bulunmuyor. Lütfen daha fazla erişim hakkı için sistem yöneticinizle iletişime geçin.
            </p>
            <div className="pt-6">
                <Button asChild variant="default">
                    <Link href={ROUTES.DASHBOARD}>Ana Sayfaya Dön</Link>
                </Button>
            </div>
        </div>
    );
}
