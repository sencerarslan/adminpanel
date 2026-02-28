import { CategoryForm } from '@/components/features/categories/CategoryForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
    const t = await getTranslations('categories');
    return { title: t('addNew') + ' | Admin Panel' };
}

export default async function NewCategoryPage(): Promise<React.JSX.Element> {
    const t = await getTranslations('categories');
    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('addNew')}</h1>
                <p className="text-muted-foreground mt-2">{t('addNewSubtitle')}</p>
            </div>
            <div className="bg-card p-6 border rounded-xl shadow-sm">
                <CategoryForm />
            </div>
        </div>
    );
}
