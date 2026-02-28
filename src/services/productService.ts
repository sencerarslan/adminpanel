import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/types/api.types';
import type { Product, CreateProductDto, UpdateProductDto, ProductFilters } from '@/types/product.types';

export const productService = {
    getProducts: async (filters: ProductFilters): Promise<PaginatedResponse<Product>> => {
        const { data } = await api.get<PaginatedResponse<Product>>('/products', { params: filters });
        return data;
    },
    getProduct: async (id: string): Promise<Product> => {
        const { data } = await api.get<{ data: Product }>(`/products/${id}`);
        return data.data;
    },
    createProduct: async (payload: CreateProductDto): Promise<Product> => {
        const { data } = await api.post<{ data: Product }>('/products', payload);
        return data.data;
    },
    updateProduct: async (id: string, payload: UpdateProductDto): Promise<Product> => {
        const { data } = await api.patch<{ data: Product }>(`/products/${id}`, payload);
        return data.data;
    },
    deleteProduct: async (id: string): Promise<void> => {
        await api.delete(`/products/${id}`);
    },
    bulkDelete: async (ids: string[]): Promise<void> => {
        await api.post('/products/bulk-delete', { ids });
    },
};
