'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Product } from '@/types/product.types';

interface ColumnActionsProps {
    row: { original: Product };
    onDelete?: (id: string) => void;
}

function ProductRowActions({ row, onDelete }: ColumnActionsProps): React.JSX.Element {
    const tCommon = useTranslations('common');
    const product = row.original;

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
                <DropdownMenuItem asChild>
                    <Link href={`/products/${product.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {tCommon('edit')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(product.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
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
            checked={table.getIsAllPageRowsSelected()}
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

function TitleHeader(): React.JSX.Element {
    const t = useTranslations('productColumns');
    return <span>{t('title')}</span>;
}
function SkuHeader(): React.JSX.Element {
    const t = useTranslations('productColumns');
    return <span>{t('sku')}</span>;
}
function PriceHeader(): React.JSX.Element {
    const t = useTranslations('productColumns');
    return <span>{t('price')}</span>;
}
function StockHeader(): React.JSX.Element {
    const t = useTranslations('productColumns');
    return <span>{t('stock')}</span>;
}
function AddedAtHeader(): React.JSX.Element {
    const t = useTranslations('productColumns');
    return <span>{t('addedAt')}</span>;
}

export const productColumns = (onDelete?: (id: string) => void): ColumnDef<Product>[] => [
    {
        id: 'select',
        header: ({ table }) => <SelectAllHeader table={table} />,
        cell: ({ row }) => <SelectRowCell row={row} />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'title',
        header: () => <TitleHeader />,
        cell: ({ row }) => {
            const cover = row.original.coverImage;
            return (
                <div className="flex items-center gap-3">
                    {cover ? (
                        <img src={cover} alt={row.original.title} className="w-10 h-10 object-cover rounded shadow-sm" />
                    ) : (
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-xs text-slate-500">—</div>
                    )}
                    <span className="font-medium">{row.getValue('title')}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'sku',
        header: () => <SkuHeader />,
    },
    {
        accessorKey: 'price',
        header: () => <PriceHeader />,
        cell: ({ row }) => {
            const price = parseFloat(row.getValue('price'));
            const formatted = new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
            }).format(price);
            return <span className="font-medium">{formatted}</span>;
        },
    },
    {
        accessorKey: 'stock',
        header: () => <StockHeader />,
    },
    {
        accessorKey: 'createdAt',
        header: () => <AddedAtHeader />,
        cell: ({ row }) => {
            const date = new Date(row.getValue('createdAt'));
            return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <ProductRowActions row={row} onDelete={onDelete} />,
    },
];
