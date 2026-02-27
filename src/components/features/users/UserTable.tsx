'use client';

import * as React from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';
import { type PaginationState } from '@tanstack/react-table';
import { useDebounce } from 'use-debounce';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

import { DataTable } from '@/components/ui/DataTable';
import { userColumns } from './columns';
import { useUsers, useDeleteUser, useBulkDeleteUsers } from '@/hooks/useUsers';
import { usePagePermission } from '@/hooks/usePagePermission';
import { PAGE_KEYS } from '@/constants/pages';

import { UserCreateDialog } from './UserCreateDialog';
import { UserPermissionDialog } from './UserPermissionDialog';
import type { User } from '@/types/user.types';
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

export function UserTable() {
    const { canDelete, canCreate } = usePagePermission(PAGE_KEYS.USERS);

    // URL state
    const [search, setSearch] = useQueryState('search', { defaultValue: '' });
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const [debouncedSearch] = useDebounce(search, 500);

    const [rowSelection, setRowSelection] = React.useState({});
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    // Permission Dialog State
    const [permDialogOpen, setPermDialogOpen] = React.useState(false);
    const [selectedUserForPerm, setSelectedUserForPerm] = React.useState<User | null>(null);

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [userToDelete, setUserToDelete] = React.useState<{ id: string; name: string } | null>(null);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);

    const filters = React.useMemo(
        () => ({
            search: debouncedSearch,
            page,
            perPage: 10,
        }),
        [debouncedSearch, page],
    );

    const { data, isLoading } = useUsers(filters);
    const deleteMutation = useDeleteUser();
    const bulkDeleteMutation = useBulkDeleteUsers();

    const handlePaginationChange = (updater: any) => {
        const newState: PaginationState =
            typeof updater === 'function'
                ? updater({
                    pageIndex: page - 1,
                    pageSize: 10,
                })
                : updater;

        setPage(newState.pageIndex + 1);
    };

    const handleDelete = (id: string, name: string) => {
        setUserToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            deleteMutation.mutate(userToDelete.id, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setUserToDelete(null);
                },
            });
        }
    };

    const handleManagePermissions = (user: User) => {
        setSelectedUserForPerm(user);
        setPermDialogOpen(true);
    };

    const handleBulkDeleteClicked = () => {
        setBulkDeleteDialogOpen(true);
    };

    const confirmBulkDelete = () => {
        bulkDeleteMutation.mutate(selectedIds, {
            onSuccess: () => {
                setRowSelection({});
                setSelectedIds([]);
                setBulkDeleteDialogOpen(false);
            },
        });
    };

    const columns = React.useMemo(() => userColumns(handleDelete, handleManagePermissions), []);

    const toolbar = (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Kullanıcı ara..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1); // Reset to page 1 on search
                    }}
                    className="w-64"
                />
            </div>
            <div className="flex items-center gap-2">
                {selectedIds.length > 0 && canDelete && (
                    <Button variant="destructive" size="sm" onClick={handleBulkDeleteClicked}>
                        <Trash className="mr-2 h-4 w-4" />
                        {selectedIds.length} Seçiliyi Sil
                    </Button>
                )}
                {canCreate && (
                    <UserCreateDialog>
                        <Button size="sm">Yeni Kullanıcı</Button>
                    </UserCreateDialog>
                )}
            </div>
        </div>
    );

    return (
        <>
            <DataTable
                columns={columns}
                data={data?.data ?? []}
                isLoading={isLoading}
                pageCount={data?.pagination.totalPages ?? -1}
                pagination={{ pageIndex: page - 1, pageSize: 10 }}
                onPaginationChange={handlePaginationChange}
                rowSelection={rowSelection}
                onRowSelectionStateChange={setRowSelection}
                onRowSelectionChange={(rows) => setSelectedIds(rows.map((r) => r.id))}
                toolbar={toolbar}
                emptyMessage="Kullanıcı bulunamadı."
            />

            {selectedUserForPerm && (
                <UserPermissionDialog
                    user={selectedUserForPerm}
                    open={permDialogOpen}
                    onOpenChange={(op) => setPermDialogOpen(op)}
                />
            )}

            {/* Single Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Seçili kullanıcıyı silmek istediğinize emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            "{userToDelete?.name}" adlı kullanıcı kalıcı olarak silinecek. Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Dialog */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{selectedIds.length} kullanıcıyı silmek istediğinize emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Seçili kullanıcılar kalıcı olarak silinecek. Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBulkDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={bulkDeleteMutation.isPending}
                        >
                            Tümünü Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
