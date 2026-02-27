'use client';

import * as React from 'react';
import {
    type ColumnDef,
    type PaginationState,
    type OnChangeFn,
    type SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    isLoading?: boolean;
    pageCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: OnChangeFn<PaginationState>;
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    onRowSelectionChange?: (rows: TData[]) => void;
    toolbar?: React.ReactNode;
    emptyMessage?: string;
    rowSelection?: Record<string, boolean>;
    onRowSelectionStateChange?: OnChangeFn<Record<string, boolean>>;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading,
    pageCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    onRowSelectionChange,
    toolbar,
    emptyMessage = 'Kayıt bulunamadı.',
    rowSelection = {},
    onRowSelectionStateChange,
}: DataTableProps<TData, TValue>): React.JSX.Element {
    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            pagination,
            sorting,
            rowSelection,
        },
        enableRowSelection: true,
        manualPagination: true,
        manualSorting: true,
        onPaginationChange,
        onSortingChange,
        onRowSelectionChange: onRowSelectionStateChange,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row: any) => row.id,
    });

    // Call onRowSelectionChange prop when internal row selection changes
    React.useEffect(() => {
        if (onRowSelectionChange) {
            const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
            // Actually we just pass the selected rows' data
            const selectedRowsData = table.getSelectedRowModel().rows.map((row) => row.original);
            onRowSelectionChange(selectedRowsData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowSelection]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {toolbar}
                <div className="rounded-md border border-border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            <Skeleton className="h-4 w-[100px]" />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((c, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {toolbar}
            <div className="rounded-md border border-border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{' '}
                    satır seçili.
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        className="rounded p-1 text-sm disabled:opacity-50"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Önceki
                    </button>
                    <span className="text-sm">
                        Sayfa {table.getState().pagination?.pageIndex! + 1} / {table.getPageCount() || 1}
                    </span>
                    <button
                        className="rounded p-1 text-sm disabled:opacity-50"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Sonraki
                    </button>
                </div>
            </div>
        </div>
    );
}
