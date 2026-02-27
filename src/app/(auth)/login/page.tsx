import type { Metadata } from 'next';
import { LoginForm } from '@/components/features/auth/LoginForm';

export const metadata: Metadata = {
    title: 'Giriş Yap',
};

export default function LoginPage(): React.JSX.Element {
    return <LoginForm />;
}
