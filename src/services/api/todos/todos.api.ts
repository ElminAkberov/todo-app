import { baseApi } from '@/services/baseApi'
import type {
  CreateTodoInput,
  Todo,
  TodoListResponse,
  TodoQuery,
  UpdateTodoInput,
} from './todos.types'

function buildQueryString(params: TodoQuery): string {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.limit) search.set('limit', String(params.limit))
  if (params.priority) search.set('priority', params.priority)
  if (params.search?.trim()) search.set('search', params.search.trim())
  if (params.sortBy) search.set('sortBy', params.sortBy)
  if (params.sortOrder) search.set('sortOrder', params.sortOrder)
  // 'all' is the server default, so it is left off the query string.
  if (params.status && params.status !== 'all') search.set('status', params.status)
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const todosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTodos: builder.query<TodoListResponse, TodoQuery>({
      query: (params) => `/todos${buildQueryString(params)}`,
      transformResponse: (res: {
        message: string
        data: Todo[]
        meta: TodoListResponse['meta']
      }) => ({ todos: res.data, meta: res.meta }),
      // Tag each row plus a LIST sentinel, so a create/delete refetches the
      // page while a toggle/edit can invalidate just the one row.
      providesTags: (result) =>
        result
          ? [
              ...result.todos.map(({ id }) => ({ type: 'Todo' as const, id })),
              { type: 'Todo' as const, id: 'LIST' },
            ]
          : [{ type: 'Todo' as const, id: 'LIST' }],
    }),

    createTodo: builder.mutation<Todo, CreateTodoInput>({
      query: (body) => ({ url: '/todos', method: 'POST', body }),
      transformResponse: (res: { message: string; data: Todo }) => res.data,
      // Position depends on the active sort and may land on another page,
      // so refetch rather than patching the cache optimistically.
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
    }),

    /** PATCH /todos/{id} — title and/or priority only; `completed` is not updatable here. */
    updateTodo: builder.mutation<Todo, UpdateTodoInput>({
      query: ({ id, title, priority }) => ({
        url: `/todos/${id}`,
        method: 'PATCH',
        body: {
          ...(title !== undefined && { title }),
          ...(priority !== undefined && { priority }),
        },
      }),
      transformResponse: (res: { message: string; data: Todo }) => res.data,
      async onQueryStarted({ id, title, priority, query }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          todosApi.util.updateQueryData('getTodos', query, (draft) => {
            const todo = draft.todos.find((t) => t.id === id)
            if (!todo) return
            if (title !== undefined) todo.title = title
            if (priority !== undefined) todo.priority = priority
          })
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),

    /** PATCH /todos/{id}/toggle — the only endpoint that flips `completed`. */
    toggleTodo: builder.mutation<Todo, { id: string; query: TodoQuery }>({
      query: ({ id }) => ({ url: `/todos/${id}/toggle`, method: 'PATCH' }),
      transformResponse: (res: { message: string; data: Todo }) => res.data,
      async onQueryStarted({ id, query }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          todosApi.util.updateQueryData('getTodos', query, (draft) => {
            const todo = draft.todos.find((t) => t.id === id)
            if (todo) todo.completed = !todo.completed
          })
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      // The optimistic patch keeps the checkbox instant; invalidating the list
      // refreshes the separate active/completed count queries, and moves the
      // row out of a filtered ("Active" / "Completed") view.
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
    }),

    /** DELETE /todos/{id}/delete — note the suffix; DELETE /todos/{id} is not routed. */
    deleteTodo: builder.mutation<Todo, { id: string; query: TodoQuery }>({
      query: ({ id }) => ({ url: `/todos/${id}/delete`, method: 'DELETE' }),
      transformResponse: (res: { message: string; data: Todo }) => res.data,
      // The row is removed from the cache immediately, so it disappears the
      // moment it is clicked; a failure restores it. Because the row unmounts
      // right away there is deliberately no per-row spinner for delete —
      // the removal itself is the feedback.
      async onQueryStarted({ id, query }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          todosApi.util.updateQueryData('getTodos', query, (draft) => {
            draft.todos = draft.todos.filter((t) => t.id !== id)
          })
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      // Refetch afterwards so the page refills from the next page's rows.
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
    }),

    /**
     * DELETE /todos/delete/completed — returns the number removed.
     * The service and controller each wrap the result, hence data.data.count.
     */
    deleteCompletedTodos: builder.mutation<number, void>({
      query: () => ({ url: '/todos/delete/completed', method: 'DELETE' }),
      transformResponse: (res: {
        message: string
        data: { message: string; data: { count: number } }
      }) => res.data?.data?.count ?? 0,
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useToggleTodoMutation,
  useDeleteTodoMutation,
  useDeleteCompletedTodosMutation,
} = todosApi
