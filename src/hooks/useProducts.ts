import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { queryKeys } from '@/constants/queryKeys';
import type { ProductFilters, CreateProductDto, UpdateProductDto } from '@/types/product.types';

export function useProducts(filters: ProductFilters) {
    return useQuery({
        queryKey: queryKeys.products.list(filters),
        queryFn: () => productService.getProducts(filters),
    });
}

export function useProduct(id: string) {
    return useQuery({
        queryKey: queryKeys.products.detail(id),
        queryFn: () => productService.getProduct(id),
        enabled: !!id,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateProductDto) => productService.createProduct(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateProductDto }) => productService.updateProduct(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => productService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useBulkDeleteProducts() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => productService.bulkDelete(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}
