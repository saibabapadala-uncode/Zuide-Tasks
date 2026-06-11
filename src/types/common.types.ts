export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'completed'

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  meta?: PaginationMeta
}

export interface SelectOption {
  value: string
  label: string
}

export interface DateRange {
  startDate: string
  endDate: string
}
