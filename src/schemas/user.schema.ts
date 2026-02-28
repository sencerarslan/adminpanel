import { z } from 'zod';
import { PAGE_KEYS } from '@/constants/pages';

export const createUserSchema = z.object({
    name: z.string().min(2, 'Ad en az 2 karakter olmalıdır').max(100),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    isSuperAdmin: z.boolean(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserPermissionsSchema = z.object({
    permissions: z.array(
        z.object({
            pageKey: z.enum([
                PAGE_KEYS.USERS,
                PAGE_KEYS.PRODUCTS,
                PAGE_KEYS.CATEGORIES,
                PAGE_KEYS.REPORTS,
            ]),
            canView: z.boolean(),
            canCreate: z.boolean(),
            canUpdate: z.boolean(),
            canDelete: z.boolean(),
        })
    ),
});

export type UpdateUserPermissionsDto = z.infer<typeof updateUserPermissionsSchema>;
