'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { createProductSchema, type CreateProductSchema } from '@/schemas/product.schema';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useAllCategories } from '@/hooks/useCategories';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUploader } from '@/components/ui/ImageUploader';

// Dynamic import for React-Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <Skeleton className="h-40 w-full" />,
});
import 'react-quill-new/dist/quill.snow.css';

interface ProductFormProps {
    initialData?: CreateProductSchema & { id: string };
    isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit }: ProductFormProps): React.JSX.Element {
    const router = useRouter();
    const t = useTranslations('products');
    const tCommon = useTranslations('common');

    const form = useForm<CreateProductSchema>({
        resolver: zodResolver(createProductSchema),
        defaultValues: initialData || {
            title: '',
            description: '',
            price: 0,
            stock: 0,
            sku: '',
            coverImage: '',
            images: [],
            categoryIds: [],
            isActive: true,
        },
    });

    const { data: categories = [] } = useAllCategories();
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();

    const isPending = createMutation.isPending || updateMutation.isPending;

    function onSubmit(values: CreateProductSchema): void {
        if (isEdit && initialData) {
            updateMutation.mutate(
                { id: initialData.id, payload: values },
                {
                    onSuccess: () => {
                        toast.success(t('updateSuccess'));
                        router.push('/products');
                    },
                }
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    toast.success(t('createSuccess'));
                    router.push('/products');
                },
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('titleField')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('titlePlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('sku')}</FormLabel>
                                <FormControl>
                                    <Input placeholder="PRD-001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('price')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('stock')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                        <div className='flex flex-row gap-6'>
                            <FormItem className='flex-item max-w-[230px]'>
                                <FormLabel>{t('coverImage')}</FormLabel>
                                <FormControl>
                                    <ImageUploader
                                        mode="single"
                                        label={t('coverImageLabel')}
                                        value={field.value ?? ''}
                                        onChange={(url) => field.onChange(typeof url === 'string' ? url : url[0] ?? '')}
                                        aspectRatio={4 / 3}
                                    />
                                </FormControl>
                                <FormMessage />

                                <p className="text-[0.8rem] text-muted-foreground">
                                    {t('coverImageHint')}
                                </p>
                            </FormItem>
                        </div>
                    )}
                />

                <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('images')}</FormLabel>
                            <FormControl>
                                <ImageUploader
                                    mode="gallery"
                                    label={t('imagesLabel')}
                                    value={Array.isArray(field.value) ? field.value : []}
                                    onChange={(urls) =>
                                        field.onChange(Array.isArray(urls) ? urls : [urls])
                                    }
                                    maxImages={12}
                                />
                            </FormControl>
                            <p className="text-[0.8rem] text-muted-foreground">
                                {t('imagesHint')}
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="categoryIds"
                    render={({ field }) => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">{t('categories')}</FormLabel>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {categories.map((category) => (
                                    <div key={category.id} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={
                                                    Array.isArray(field.value)
                                                        ? field.value.includes(category.id)
                                                        : false
                                                }
                                                onCheckedChange={(checked) => {
                                                    const currentValue = Array.isArray(field.value)
                                                        ? field.value
                                                        : [];
                                                    if (checked) {
                                                        field.onChange([...currentValue, category.id]);
                                                    } else {
                                                        field.onChange(
                                                            currentValue.filter((val) => val !== category.id)
                                                        );
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                            {category.name}
                                        </FormLabel>
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <span className="text-sm text-gray-500">{t('noCategory')}</span>
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="h-[300px]">
                            <FormLabel>{t('description')}</FormLabel>
                            <FormControl>
                                <ReactQuill
                                    className="h-[200px]"
                                    theme="snow"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-1">
                            <FormControl>
                                <Checkbox
                                    checked={field.value ?? false}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">{t('isActive')}</FormLabel>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4 mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isPending}
                    >
                        {tCommon('cancel')}
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? tCommon('update') : tCommon('create')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
