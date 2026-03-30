export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
  timestamp: string;
  version?: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
  statusCode?: number;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

export interface ListResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface UploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  thumbnailUrl?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  deletedCount: number;
}

export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  errors?: Array<{
    id: string;
    message: string;
  }>;
}

export interface StatsResponse {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  growthRate: number;
  byCategory?: Record<string, number>;
  byStatus?: Record<string, number>;
  byPriority?: Record<string, number>;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
  query: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
  validationErrors?: ValidationError[];
  stack?: string;
}