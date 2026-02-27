'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { updateUserPermissionsSchema, type UpdateUserPermissionsDto } from '@/schemas/user.schema';
import { useUpdateUserPermissions } from '@/hooks/useUsers';
import { usePagePermission } from '@/hooks/usePagePermission';
import { PAGE_KEYS } from '@/constants/pages';
import type { User } from '@/types/user.types';

interface UserPermissionDialogProps {
    user: User & {
        permissions?: Array<{
            pageKey: string;
            canView: boolean;
            canCreate: boolean;
            canUpdate: boolean;
            canDelete: boolean;
        }>;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ALL_PAGES = [
    { key: PAGE_KEYS.USERS, label: 'Kullanıcılar' },
    { key: PAGE_KEYS.ORDERS, label: 'Siparişler' },
    { key: PAGE_KEYS.PRODUCTS, label: 'Ürünler' },
    { key: PAGE_KEYS.REPORTS, label: 'Raporlar' },
    { key: PAGE_KEYS.SETTINGS, label: 'Ayarlar' },
];

export function UserPermissionDialog({ user, open, onOpenChange }: UserPermissionDialogProps) {
    const { canUpdate } = usePagePermission(PAGE_KEYS.USERS);
    const { mutate, isPending } = useUpdateUserPermissions();

    const defaultPermissions = ALL_PAGES.map((page) => {
        const existing = user.permissions?.find((p) => p.pageKey === page.key);
        return {
            pageKey: page.key as any,
            canView: existing?.canView ?? false,
            canCreate: existing?.canCreate ?? false,
            canUpdate: existing?.canUpdate ?? false,
            canDelete: existing?.canDelete ?? false,
            _label: page.label,
        };
    });

    const form = useForm<any>({
        resolver: zodResolver(updateUserPermissionsSchema),
        defaultValues: {
            permissions: defaultPermissions,
        },
    });

    // Reset form when user changes
    React.useEffect(() => {
        form.reset({ permissions: defaultPermissions });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.id, open]);

    const onSubmit = (values: any) => {
        mutate(
            { id: user.id, payload: { permissions: values.permissions } },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    if (!canUpdate) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{user.name} - İzinleri Yönet</DialogTitle>
                </DialogHeader>

                {user.isSuperAdmin ? (
                    <div className="rounded-md bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                        <strong>Bilgi:</strong> Bu kullanıcı bir Süper Admin olduğu için sistemdeki tüm sayfalara ve işlemlere tam erişimi vardır. İzinleri sınırlandırmak isterseniz önce Süper Admin yetkisini kaldırmalısınız.
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="rounded-md border border-border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="p-3 text-left font-semibold">Sayfa</th>
                                            <th className="p-3 text-center font-semibold text-muted-foreground">Görüntüle</th>
                                            <th className="p-3 text-center font-semibold text-muted-foreground">Oluştur</th>
                                            <th className="p-3 text-center font-semibold text-muted-foreground">Düzenle</th>
                                            <th className="p-3 text-center font-semibold text-muted-foreground">Sil</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {defaultPermissions.map((pageConf, index) => (
                                            <tr key={pageConf.pageKey} className="hover:bg-muted/30">
                                                <td className="p-3 font-medium">{pageConf._label}</td>
                                                {['canView', 'canCreate', 'canUpdate', 'canDelete'].map((actionName) => (
                                                    <td key={actionName} className="p-3 text-center">
                                                        <FormField
                                                            control={form.control}
                                                            name={`permissions.${index}.${actionName}` as any}
                                                            render={({ field }) => (
                                                                <FormItem className="m-0 flex items-center justify-center p-0">
                                                                    <FormControl>
                                                                        <Switch
                                                                            checked={field.value}
                                                                            onCheckedChange={field.onChange}
                                                                            aria-label={`${pageConf._label} için ${actionName}`}
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    İptal
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Kaydet
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
