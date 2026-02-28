'use client';

import { use } from 'react';
import { ProductForm } from '@/components/features/products/ProductForm';
import { useProduct } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }): React.JSX.Element {
    const resolvedParams = use(params);
    const { data: product, isLoading, isError } = useProduct(resolvedParams.id);
    const t = useTranslations('products');

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto w-full mt-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-[500px] w-full mt-4" />
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                {t('loadError')}
            </div>
        );
    }

    const initialData = {
        ...product,
        price: Number(product.price),
        categoryIds: product.categories?.map((c: any) => c.id) || [],
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('edit')}</h1>
                <p className="text-muted-foreground mt-2">{t('editSubtitle')}</p>
            </div>
            <div className="bg-card p-6 border rounded-xl shadow-sm">
                <ProductForm initialData={initialData} isEdit />
            </div>
        </div>
    );
}
