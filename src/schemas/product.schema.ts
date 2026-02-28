import { z } from 'zod';

export const createProductSchema = z.object({
    title: z.string().min(2, 'Başlık en az 2 karakter olmalıdır'),
    description: z.string().nullable(),
    price: z.number({ message: 'Geçersiz fiyat' } as any).min(0, 'Fiyat 0 veya daha büyük olmalıdır'),
    stock: z.number({ message: 'Geçersiz stok' } as any).int('Stok tam sayı olmalıdır').min(0, 'Stok 0 veya daha büyük olmalıdır'),
    sku: z.string().min(1, 'Ürün kodu zorunludur'),
    coverImage: z.string().nullable(),
    images: z.array(z.string()),
    categoryIds: z.array(z.string()),
    isActive: z.boolean(),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;

export const createCategorySchema = z.object({
    name: z.string().min(2, 'Kategori adı en az 2 karakter olmalıdır'),
    slug: z.string().min(2, 'Slug en az 2 karakter olmalıdır'),
    description: z.string().nullable().optional(),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
