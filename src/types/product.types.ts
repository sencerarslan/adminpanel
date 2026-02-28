export interface Category {
  readonly id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateCategoryDto = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export interface Product {
  readonly id: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  coverImage: string | null;
  images: string[];
  categories?: Category[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateProductDto = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'categories'> & {
  categoryIds?: string[];
};

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductFilters {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryFilters {
  page?: number;
  perPage?: number;
  search?: string;
}
