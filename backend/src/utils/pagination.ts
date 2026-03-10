import { PaginatedResult } from '../types';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Calculates the skip and take values Prisma needs from page and limit params
export function getPaginationParams(params: PaginationParams): {
  skip: number;
  take: number;
  page: number;
  limit: number;
} {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
}

// Wraps a data array and total count into a standardized paginated response
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}