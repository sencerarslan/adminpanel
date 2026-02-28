import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/types/api.types';
import type { Category, CategoryFilters, UpdateCategoryDto } from '@/types/product.types';
import type { CreateCategorySchema } from '@/schemas/product.schema';

export const categoryService = {
    getCategories: async (filters?: CategoryFilters): Promise<PaginatedResponse<Category>> => {
        const { data } = await api.get<PaginatedResponse<Category>>('/categories', { params: filters });
        return data;
    },
    getAll: async (): Promise<Category[]> => {
        const { data } = await api.get<{ data: Category[] }>('/categories/all');
        return data.data;
    },
    createCategory: async (payload: CreateCategorySchema): Promise<Category> => {
        const { data } = await api.post<{ data: Category }>('/categories', payload);
        return data.data;
    },
    getCategory: async (id: string): Promise<Category> => {
        const { data } = await api.get<{ data: Category }>(`/categories/${id}`);
        return data.data;
    },
    updateCategory: async (id: string, payload: UpdateCategoryDto): Promise<Category> => {
        const { data } = await api.patch<{ data: Category }>(`/categories/${id}`, payload);
        return data.data;
    },
    deleteCategory: async (id: string): Promise<void> => {
        await api.delete(`/categories/${id}`);
    },
    bulkDelete: async (ids: string[]): Promise<void> => {
        await api.post('/categories/bulk-delete', { ids });
    },
};
