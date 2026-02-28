import { CategoryTable } from '@/components/features/categories/CategoryTable';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
    const t = await getTranslations('categories');
    return { title: t('title') + ' | Admin Panel' };
}

export default async function CategoriesPage(): Promise<React.JSX.Element> {
    const t = await getTranslations('categories');
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
            </div>
            <div className="bg-card p-6 border rounded-xl shadow-sm">
                <CategoryTable />
            </div>
        </div>
    );
}
