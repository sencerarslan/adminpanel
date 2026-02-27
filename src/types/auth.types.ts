export interface PagePermission {
    pageKey: string;
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

export interface AuthUser {
    readonly id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    isSuperAdmin: boolean;
    permissions: PagePermission[];
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: AuthUser;
}
