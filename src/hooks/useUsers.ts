import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import type { UserFilters } from '@/types/user.types';
import type { CreateUserDto, UpdateUserPermissionsDto } from '@/schemas/user.schema';
import { queryKeys } from '@/constants/queryKeys';
import { toast } from 'sonner';

export function useUsers(filters: UserFilters) {
    return useQuery({
        queryKey: queryKeys.users.list(filters),
        queryFn: () => userService.getUsers(filters),
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => userService.deleteUser(id),
        onSuccess: () => {
            toast.success('Kullanıcı başarıyla silindi');
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useBulkDeleteUsers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => userService.bulkDelete(ids),
        onSuccess: () => {
            toast.success('Seçili kullanıcılar silindi');
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateUserDto) => userService.createUser(payload),
        onSuccess: () => {
            toast.success('Kullanıcı başarıyla oluşturuldu');
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useUpdateUserPermissions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPermissionsDto }) =>
            userService.updatePermissions(id, payload),
        onSuccess: () => {
            toast.success('İzinler başarıyla güncellendi');
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}
