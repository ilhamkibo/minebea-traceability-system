import { PaginationMeta } from "./pagination";

export interface ApiResponse<T> {
  status: boolean
  message: string
  data: T
  pagination?: PaginationMeta
}

export type ApiError = {
  status: boolean;
  message: string;
  errors?: Record<string, string[]>;
};
