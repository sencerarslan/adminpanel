'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types/user.types';

function UserRowActions({
    user,
    onDelete,
    onManagePermissions,
}: {
    user: User;
    onDelete: (id: string, name: string) => void;
    onManagePermissions: (user: User) => void;
}): React.JSX.Element {
    const t = useTranslations('users');
    const tCommon = useTranslations('common');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" aria-label={tCommon('openMenu')}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{tCommon('actions')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                    {t('copyId')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManagePermissions(user)}>
                    {t('managePermissions')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={() => onDelete(user.id, user.name)}
                >
                    {tCommon('delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function SelectAllHeader({ table }: { table: any }): React.JSX.Element {
    const t = useTranslations('table');
    return (
        <Checkbox
            checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t('selectAll')}
        />
    );
}

function SelectRowCell({ row }: { row: any }): React.JSX.Element {
    const t = useTranslations('table');
    return (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t('selectRow')}
        />
    );
}

function StatusCell({ isActive }: { isActive: boolean }): React.JSX.Element {
    const t = useTranslations('userColumns');
    return (
        <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${isActive
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
        >
            {isActive ? t('active') : t('inactive')}
        </span>
    );
}

function NameHeader(): React.JSX.Element {
    return <span>{useTranslations('userColumns')('name')}</span>;
}
function EmailHeader(): React.JSX.Element {
    return <span>{useTranslations('userColumns')('email')}</span>;
}
function StatusHeader(): React.JSX.Element {
    return <span>{useTranslations('userColumns')('status')}</span>;
}

export const userColumns = (
    onDelete: (id: string, name: string) => void,
    onManagePermissions: (user: User) => void,
): ColumnDef<User>[] => [
        {
            id: 'select',
            header: ({ table }) => <SelectAllHeader table={table} />,
            cell: ({ row }) => <SelectRowCell row={row} />,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: () => <NameHeader />,
        },
        {
            accessorKey: 'email',
            header: () => <EmailHeader />,
        },
        {
            accessorKey: 'isActive',
            header: () => <StatusHeader />,
            cell: ({ row }) => <StatusCell isActive={row.getValue('isActive')} />,
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <UserRowActions
                    user={row.original}
                    onDelete={onDelete}
                    onManagePermissions={onManagePermissions}
                />
            ),
        },
    ];
