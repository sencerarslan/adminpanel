export interface User {
    readonly id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    isSuperAdmin: boolean;
    isActive: boolean;
    createdAt: string;
}

export interface UserFilters extends Record<string, unknown> {
    search?: string;
    page?: number;
    perPage?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
