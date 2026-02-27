import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Şifremi Unuttum',
};

export default function ForgotPasswordPage(): React.JSX.Element {
    return (
        <div className="w-full max-w-md">
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
                <h1 className="mb-2 text-2xl font-bold text-white">Şifrenizi sıfırlayın</h1>
                <p className="mb-6 text-sm text-slate-400">
                    E-posta adresinizi giriniz, şifre sıfırlama bağlantısı göndereceğiz.
                </p>
                <p className="text-center text-sm text-slate-500">Yakında eklenecek...</p>
            </div>
        </div>
    );
}
