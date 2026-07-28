export interface Todo {
  id: number
  text: string
  completed: boolean
}

export type FilterType = 'all' | 'active' | 'completed'

export type SortType = 'alphabetical' | 'status'
