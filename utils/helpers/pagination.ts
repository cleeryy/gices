import { PaginationParams, PaginationResult } from "../types/api";

export function getPaginationParams(
  page?: string | number,
  limit?: string | number
): Required<Pick<PaginationParams, "page" | "limit">> {
  const pageNum = Math.max(1, parseInt(String(page || "1")));
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit || "10"))));

  return {
    page: pageNum,
    limit: limitNum,
  };
}

export function calculatePagination<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function getPrismaSkipTake(page: number, limit: number) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
