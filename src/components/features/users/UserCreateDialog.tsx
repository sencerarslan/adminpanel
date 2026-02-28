'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { createUserSchema, type CreateUserDto } from '@/schemas/user.schema';
import { useCreateUser } from '@/hooks/useUsers';
import { usePagePermission } from '@/hooks/usePagePermission';
import { PAGE_KEYS } from '@/constants/pages';

interface UserCreateDialogProps {
    children: React.ReactNode;
}

export function UserCreateDialog({ children }: UserCreateDialogProps): React.JSX.Element | null {
    const [open, setOpen] = React.useState(false);
    const { canCreate } = usePagePermission(PAGE_KEYS.USERS);
    const { mutate, isPending } = useCreateUser();
    const t = useTranslations('users');
    const tCommon = useTranslations('common');
    const tAuth = useTranslations('auth');

    const form = useForm<CreateUserDto>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            isSuperAdmin: false,
        },
    });

    const onSubmit = (values: CreateUserDto) => {
        mutate(values, {
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    if (!canCreate) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('addNew')}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('name')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('namePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tAuth('email')}</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder={t('emailPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tAuth('password')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder={t('passwordPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isSuperAdmin"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>{t('superAdmin')}</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {tCommon('create')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
