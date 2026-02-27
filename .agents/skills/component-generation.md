---
description: Step-by-step guide for generating feature components following project conventions
---

# Skill: Component Generation

Bu skill, yeni bir domain bileşeni oluşturulması gerektiğinde izlenecek adımları tanımlar.

---

## 1. Domain Tipini Tanımla

```ts
// src/types/<domain>.types.ts
export interface Product {
  readonly id: string;
  name: string;
  price: number;
  status: ProductStatus;
  createdAt: string;
}

export type ProductStatus = 'active' | 'inactive' | 'draft';

export interface ProductFilters {
  search?: string;
  status?: ProductStatus;
  page?: number;
  perPage?: number;
}
```

## 2. Servis Fonksiyonunu Yaz

```ts
// src/services/productService.ts
import { api } from '@/lib/api';
import type { Product, ProductFilters } from '@/types/product.types';
import type { PaginatedResponse } from '@/types/api.types';

export const productService = {
  getProducts: async (filters: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get('/products', { params: filters });
    return data;
  },
  createProduct: async (payload: CreateProductDto): Promise<Product> => {
    const { data } = await api.post('/products', payload);
    return data;
  },
  updateProduct: async (id: string, payload: UpdateProductDto): Promise<Product> => {
    const { data } = await api.patch(`/products/${id}`, payload);
    return data;
  },
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
```

## 3. TanStack Query Hook'larını Yaz

```ts
// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productService } from '@/services/productService';
import { toast } from 'sonner';

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productService.getProducts(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Ürün başarıyla silindi');
    },
    onError: () => toast.error('Ürün silinirken bir hata oluştu'),
  });
}
```

## 4. Tablo Sütunlarını Tanımla

```tsx
// src/components/features/products/columns.tsx
import type { ColumnDef } from '@tanstack/react-table';
import type { Product } from '@/types/product.types';

export const productColumns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Tümünü seç"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Satırı seç"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ürün Adı" />,
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }) => <ProductStatusBadge status={row.getValue('status')} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => <ProductRowActions product={row.original} />,
  },
];
```

## 5. Bileşen Dosya Yapısı

```
src/components/features/products/
  ProductsTable.tsx       — ana tablo bileşeni
  ProductForm.tsx         — oluşturma/düzenleme formu
  ProductRowActions.tsx   — satır başına aksiyon menüsü
  ProductStatusBadge.tsx  — durum badge bileşeni
  ProductFilters.tsx      — arama + filtre araç çubuğu
  columns.tsx             — TanStack Table sütun tanımları
  index.ts                — barrel export
```

## 6. Sayfa Dosyasını Oluştur

```tsx
// src/app/(dashboard)/products/page.tsx
import { ProductsTable } from '@/components/features/products';

export const metadata = { title: 'Ürünler | Admin Panel' };

export default function ProductsPage(): React.JSX.Element {
  return (
    <main>
      <h1 className="text-2xl font-semibold mb-6">Ürünler</h1>
      <ProductsTable />
    </main>
  );
}
```

## Kontrol Listesi

- [ ] Type tanımı `types/` altında
- [ ] Servis fonksiyonu `services/` altında
- [ ] Query/mutation hook `hooks/` altında
- [ ] Sütunlar `columns.tsx`'de tanımlı
- [ ] Loading, empty ve error state mevcut
- [ ] Toast bildirimleri eklendi
- [ ] Silme işlemi için AlertDialog kullanıldı
- [ ] Barrel export (`index.ts`) güncellendi
- [ ] Sayfa `metadata` tanımlandı
