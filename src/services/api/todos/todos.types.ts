export type TodoPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export const PRIORITIES: TodoPriority[] = ['HIGH', 'MEDIUM', 'LOW']

export interface Todo {
  id: string
  title: string
  completed: boolean
  priority: TodoPriority
  userId: string
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

/** Server-side sort field (`sortBy` query param). */
export type SortType = 'createdAt' | 'updatedAt' | 'title' | 'priority'
export type SortOrder = 'asc' | 'desc'

/** Server-side completion filter (`status` query param). */
export type FilterType = 'all' | 'active' | 'completed'

export interface TodoQuery {
  page?: number
  limit?: number
  priority?: TodoPriority
  search?: string
  sortBy?: SortType
  sortOrder?: SortOrder
  status?: FilterType
}

export interface TodoListResponse {
  todos: Todo[]
  meta: PaginationMeta
}

export interface CreateTodoInput {
  title: string
  priority?: TodoPriority
}

export interface UpdateTodoInput {
  id: string
  title?: string
  priority?: TodoPriority
  /** The active list query — required so optimistic patches hit the right cache entry. */
  query: TodoQuery
}
