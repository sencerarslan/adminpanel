'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { createCategorySchema, type CreateCategorySchema } from '@/schemas/product.schema';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CategoryFormProps {
    initialData?: CreateCategorySchema & { id: string };
    isEdit?: boolean;
}

export function CategoryForm({ initialData, isEdit }: CategoryFormProps): React.JSX.Element {
    const router = useRouter();
    const t = useTranslations('categories');
    const tCommon = useTranslations('common');

    const form = useForm<CreateCategorySchema>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: initialData || {
            name: '',
            slug: '',
            description: '',
        },
    });

    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    const isPending = createMutation.isPending || updateMutation.isPending;

    function onSubmit(values: CreateCategorySchema): void {
        if (isEdit && initialData) {
            updateMutation.mutate(
                { id: initialData.id, payload: values },
                {
                    onSuccess: () => {
                        toast.success(t('updateSuccess'));
                        router.push('/categories');
                    },
                }
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    toast.success(t('createSuccess'));
                    router.push('/categories');
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
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('name')}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('namePlaceholder')}
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            // Automatically generate slug if it's not edit mode or slug is empty
                                            if (!isEdit && !form.getValues('slug')) {
                                                const generatedSlug = e.target.value
                                                    .toLowerCase()
                                                    .replace(/ /g, '-')
                                                    .replace(/[^\w-]+/g, '');
                                                form.setValue('slug', generatedSlug);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('slug')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('slugPlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>{t('description')}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={t('descriptionPlaceholder')} {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
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
