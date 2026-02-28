import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryService';
import { queryKeys } from '@/constants/queryKeys';
import type { CategoryFilters, UpdateCategoryDto } from '@/types/product.types';
import type { CreateCategorySchema } from '@/schemas/product.schema';

export function useCategories(filters?: CategoryFilters) {
    return useQuery({
        queryKey: queryKeys.categories.list(filters || {}),
        queryFn: () => categoryService.getCategories(filters),
    });
}

export function useAllCategories() {
    return useQuery({
        queryKey: queryKeys.categories.all,
        queryFn: () => categoryService.getAll(),
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateCategorySchema) => categoryService.createCategory(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
}

export function useCategory(id: string) {
    return useQuery({
        queryKey: queryKeys.categories.detail(id),
        queryFn: () => categoryService.getCategory(id),
        enabled: !!id,
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryDto }) => categoryService.updateCategory(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(id) });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categoryService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
}

export function useBulkDeleteCategories() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => categoryService.bulkDelete(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
}
