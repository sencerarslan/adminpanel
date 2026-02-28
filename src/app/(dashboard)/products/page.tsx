import { ProductTable } from '@/components/features/products/ProductTable';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
    const t = await getTranslations('products');
    return { title: t('title') + ' | Admin Panel' };
}

export default async function ProductsPage(): Promise<React.JSX.Element> {
    const t = await getTranslations('products');
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
            </div>
            <ProductTable />
        </div>
    );
}
