'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types/user.types';

export const userColumns = (
    onDelete: (id: string, name: string) => void,
    onManagePermissions: (user: User) => void,
): ColumnDef<User>[] => [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Tümünü seç"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Satırı seç"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: 'Ad Soyad',
        },
        {
            accessorKey: 'email',
            header: 'E-posta',
        },
        {
            accessorKey: 'isActive',
            header: 'Durum',
            cell: ({ row }) => {
                const isOk = row.getValue('isActive');
                return (
                    <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${isOk ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30' : 'bg-red-100 text-red-800'
                            }`}
                    >
                        {isOk ? 'Aktif' : 'Pasif'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Menüyü aç</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                ID Kopyala
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onManagePermissions(user)}>
                                İzinleri Yönet
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => onDelete(user.id, user.name)}
                            >
                                Sil
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
