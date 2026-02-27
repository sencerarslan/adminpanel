import { api } from '@/lib/api';
import type { User, UserFilters } from '@/types/user.types';
import type { PaginatedResponse } from '@/types/api.types';
import type { CreateUserDto, UpdateUserPermissionsDto } from '@/schemas/user.schema';

export const userService = {
    getUsers: async (filters: UserFilters): Promise<PaginatedResponse<User>> => {
        const { data } = await api.get('/users', { params: filters });
        return data;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    bulkDelete: async (ids: string[]): Promise<void> => {
        await api.post('/users/bulk-delete', { ids });
    },

    createUser: async (payload: CreateUserDto): Promise<void> => {
        await api.post('/users', payload);
    },

    updatePermissions: async (id: string, payload: UpdateUserPermissionsDto): Promise<void> => {
        await api.put(`/users/${id}/permissions`, payload);
    },
};
