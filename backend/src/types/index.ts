// Shared type for paginated API responses
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Generic type for all service layer responses
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}