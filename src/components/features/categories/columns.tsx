'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';
import Link from 'next/link';
import { type Category } from '@/types/product.types';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

function CategoryRowActions({
    category,
    onDelete,
}: {
    category: Category;
    onDelete: (id: string) => void;
}): React.JSX.Element {
    const tCommon = useTranslations('common');

    return (
        <div className="flex justify-end pr-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" aria-label={tCommon('openMenu')}>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{tCommon('actions')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/categories/${category.id}`} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> {tCommon('edit')}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onDelete(category.id)}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                    >
                        <Trash className="mr-2 h-4 w-4" /> {tCommon('delete')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function SelectAllHeader({ table }: { table: any }): React.JSX.Element {
    const t = useTranslations('table');
    return (
        <div className="w-12 text-center flex justify-center items-center">
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label={t('selectAll')}
            />
        </div>
    );
}

function SelectRowCell({ row }: { row: any }): React.JSX.Element {
    const t = useTranslations('table');
    return (
        <div className="w-12 text-center flex justify-center items-center">
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label={t('selectRow')}
            />
        </div>
    );
}

function CategoryNameHeader(): React.JSX.Element {
    return <span>{useTranslations('categoryColumns')('name')}</span>;
}
function SlugHeader(): React.JSX.Element {
    return <span>{useTranslations('categoryColumns')('slug')}</span>;
}
function AddedAtHeader(): React.JSX.Element {
    return <span>{useTranslations('categoryColumns')('addedAt')}</span>;
}

export const categoryColumns = (onDelete: (id: string) => void): ColumnDef<Category>[] => [
    {
        id: 'select',
        header: ({ table }) => <SelectAllHeader table={table} />,
        cell: ({ row }) => <SelectRowCell row={row} />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: () => <CategoryNameHeader />,
        cell: ({ row }) => <span className="font-semibold">{row.getValue('name')}</span>,
    },
    {
        accessorKey: 'slug',
        header: () => <SlugHeader />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('slug')}</span>,
    },
    {
        accessorKey: 'createdAt',
        header: () => <AddedAtHeader />,
        cell: ({ row }) => {
            const date = new Date(row.getValue('createdAt'));
            return <span>{format(date, 'dd.MM.yyyy')}</span>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <CategoryRowActions category={row.original} onDelete={onDelete} />
        ),
    },
];
