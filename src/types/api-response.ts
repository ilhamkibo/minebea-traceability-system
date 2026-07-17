import { PaginationMeta } from "./pagination";

export interface ApiResponse<T> {
  status: boolean
  message: string
  data: T
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type ApiError = {
  status: boolean;
  message: string;
  errors?: Record<string, string[]>;
};
