export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
}

export type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502 | 503;
