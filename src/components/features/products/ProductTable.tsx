'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useProducts, useDeleteProduct, useBulkDeleteProducts } from '@/hooks/useProducts';
import { productColumns } from './columns';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/types/product.types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ProductTable(): React.JSX.Element {
    const t = useTranslations('products');
    const tCommon = useTranslations('common');

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [selectedRows, setSelectedRows] = useState<Product[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data, isLoading } = useProducts({ page, perPage, search });
    const deleteMutation = useDeleteProduct();
    const bulkDeleteMutation = useBulkDeleteProducts();

    const handlePaginationChange = (updater: any) => {
        if (typeof updater === 'function') {
            const newState = updater({ pageIndex: page - 1, pageSize: perPage });
            setPage(newState.pageIndex + 1);
            setPerPage(newState.pageSize);
        }
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId, {
                onSuccess: () => setDeleteId(null),
            });
        } else if (selectedRows.length > 0) {
            bulkDeleteMutation.mutate(
                selectedRows.map((r) => r.id),
                { onSuccess: () => setSelectedRows([]) }
            );
        }
    };

    const Toolbar = (
        <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2">
                {selectedRows.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={() => setDeleteId('bulk')}>
                        <Trash className="mr-2 h-4 w-4" />
                        {t('deleteSelected', { count: selectedRows.length })}
                    </Button>
                )}
            </div>
            <Button asChild>
                <Link href="/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('create')}
                </Link>
            </Button>
        </div>
    );

    const deleteTarget = deleteId === 'bulk' ? t('deleteSelectedLabel') : t('deleteSelectedThis');

    return (
        <>
            <DataTable
                columns={productColumns((id) => setDeleteId(id))}
                data={data?.data || []}
                isLoading={isLoading}
                pagination={{ pageIndex: page - 1, pageSize: perPage }}
                onPaginationChange={handlePaginationChange}
                pageCount={data?.pagination?.totalPages}
                onRowSelectionChange={setSelectedRows}
                toolbar={Toolbar}
                emptyMessage={t('notFound')}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{tCommon('deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deleteConfirm', { target: deleteTarget })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}>
                            {tCommon('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}
                        >
                            {tCommon('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
