import axios from 'axios';

export interface AppError {
    message: string;
    code?: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

export function normalizeError(error: unknown): AppError {
    if (axios.isAxiosError(error)) {
        return {
            message: error.response?.data?.message ?? 'Bir hata oluştu.',
            statusCode: error.response?.status,
            code: error.response?.data?.code,
            errors: error.response?.data?.errors,
        };
    }
    if (error instanceof Error) {
        return { message: error.message };
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return error as AppError;
    }
    return { message: 'Beklenmeyen bir hata oluştu.' };
}
