---
trigger: always_on
glob: ["**/*.tsx"]
description: TanStack Table (React Table v8) patterns and DataTable component rules
---

# Tables Rules

## Core Library

All tabular data is rendered using **TanStack Table v8** (`@tanstack/react-table`). Rolling custom table implementations is not permitted.

## Generic DataTable Component

A single reusable `DataTable<TData, TValue>` component lives in `components/ui/DataTable.tsx`. All feature-level tables compose from this component:

```tsx
// components/ui/DataTable.tsx
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  totalRows?: number;
  onRowSelectionChange?: (rows: TData[]) => void;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
}
```

## Required Table Features

Every table in the admin panel must support:

| Feature | Implementation |
|---------|---------------|
| Column sorting | `enableSorting` on column def; server-side preferred |
| Pagination | Server-side via `manualPagination: true` |
| Global search | Debounced input bound to server query param |
| Column filters | Per-column filter UI via `FilterFn` |
| Column visibility | Toggle via `DropdownMenu` + `table.getColumn().toggleVisibility()` |
| Row selection | Checkbox column with `enableRowSelection: true` |
| Bulk actions | Action bar that appears when rows are selected |
| Loading state | Skeleton rows during data fetch |
| Empty state | Illustrated empty state with message and optional CTA |

## Column Definition Pattern

Columns are defined in a co-located `columns.tsx` file next to the feature table:

```ts
// components/features/users/columns.tsx
export const userColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => <Checkbox ... />,
    cell: ({ row }) => <Checkbox ... />,
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ad" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <UserRowActions row={row} />,
  },
];
```

## Server-Side Operations

- Sorting, filtering, and pagination are handled server-side. Client-side operations are only acceptable for small static datasets (< 50 rows).
- Query params (`page`, `perPage`, `sort`, `order`, `search`, `filters`) are synced with the URL using `nuqs` or `useSearchParams` to support deep-linking and browser back/forward.

## Bulk Actions

- A toolbar appears above the table when one or more rows are selected.
- Bulk actions (delete, export, status change) are placed in this toolbar.
- Destructive bulk actions show a confirmation dialog before executing.
- After a bulk action, deselect all rows and invalidate the query cache.

## Empty & Loading States

```tsx
// Loading: render skeleton rows
if (isLoading) {
  return <DataTableSkeleton columnCount={5} rowCount={10} />;
}

// Empty: semantic empty state
if (data.length === 0) {
  return (
    <DataTableEmptyState
      title="Kayıt bulunamadı"
      description="Arama kriterlerinizi değiştirmeyi deneyin."
    />
  );
}
```

## Export

- Tables that require export support use server-side export endpoints (CSV/XLSX generated on the backend).
- Never export by serializing client-side table data — this misses server-side filtered/sorted data.
