'use client';

import { use } from 'react';
import { CategoryForm } from '@/components/features/categories/CategoryForm';
import { useCategory } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }): React.JSX.Element {
    const resolvedParams = use(params);
    const { data: category, isLoading, isError } = useCategory(resolvedParams.id);
    const t = useTranslations('categories');

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto w-full mt-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full mt-4" />
            </div>
        );
    }

    if (isError || !category) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                {t('loadError')}
            </div>
        );
    }

    const initialData = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('edit')}</h1>
                <p className="text-muted-foreground mt-2">{t('editSubtitle')}</p>
            </div>
            <div className="bg-card p-6 border rounded-xl shadow-sm">
                <CategoryForm initialData={initialData} isEdit />
            </div>
        </div>
    );
}
