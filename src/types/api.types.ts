export interface ApiResponse<TData> {
    data: TData;
    message: string;
    success: boolean;
}

export interface PaginatedResponse<TData> {
    data: TData[];
    pagination: {
        readonly page: number;
        readonly perPage: number;
        readonly total: number;
        readonly totalPages: number;
    };
}

export interface ApiError {
    message: string;
    code?: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}
