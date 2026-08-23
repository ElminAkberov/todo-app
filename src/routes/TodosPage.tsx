import { useCallback, useEffect, useMemo, useState } from 'react'

import AddTodo from '@/components/AddTodo/AddTodo'
import Pagination from '@/components/Pagination/Pagination'
import TodoFilter from '@/components/TodoFilter/TodoFilter'
import TodoList from '@/components/TodoList/TodoList'
import TodoToolbar from '@/components/TodoToolbar/TodoToolbar'
import Spinner from '@/components/ui/Spinner'
import useLocalStorage from '@/hooks/useLocalStorage'
import { getErrorMessage } from '@/services/baseApi'
import {
  useCreateTodoMutation,
  useDeleteCompletedTodosMutation,
  useDeleteTodoMutation,
  useGetTodosQuery,
  useToggleTodoMutation,
  useUpdateTodoMutation,
} from '@/services/api/todos/todos.api'
import type {
  FilterType,
  SortOrder,
  SortType,
  TodoPriority,
  TodoQuery,
} from '@/services/api/todos/todos.types'

const PAGE_SIZE = 10

/** Tracks which rows currently have a write in flight. */
function usePendingIds() {
  const [ids, setIds] = useState<Set<string>>(new Set())

  const add = useCallback((id: string) => {
    setIds((prev) => new Set(prev).add(id))
  }, [])

  const remove = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  return { ids, add, remove }
}

function TodosPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [priority, setPriority] = useState<TodoPriority | null>(null)
  // Sort choice is a UI preference, so it outlives the session.
  const [sortBy, setSortBy] = useLocalStorage<SortType>('todo:sortBy', 'createdAt')
  const [sortOrder, setSortOrder] = useLocalStorage<SortOrder>('todo:sortOrder', 'desc')
  const [filter, setFilter] = useState<FilterType>('all')
  const [addError, setAddError] = useState<string | null>(null)

  const pending = usePendingIds()

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Any change to a filtering input invalidates the current page number.
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, priority, sortBy, sortOrder, filter])

  // This object is the RTK Query cache key, so it must be referentially
  // stable — and the mutations need it to patch the right cache entry.
  const query: TodoQuery = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      priority: priority ?? undefined,
      sortBy,
      sortOrder,
      status: filter,
    }),
    [page, debouncedSearch, priority, sortBy, sortOrder, filter]
  )

  const { data, isLoading, isFetching, error } = useGetTodosQuery(query)

  const [createTodo, { isLoading: isCreating }] = useCreateTodoMutation()
  const [toggleTodo] = useToggleTodoMutation()
  const [updateTodo] = useUpdateTodoMutation()
  const [deleteTodo] = useDeleteTodoMutation()
  const [deleteCompleted, { isLoading: isClearing }] = useDeleteCompletedTodosMutation()

  // The server applies the status filter, so these rows render as received.
  const todos = data?.todos ?? []
  const meta = data?.meta

  /*
   * Counts come from the one list request already in flight — no extra
   * count-only round trip.
   *
   * On the "Active" view `meta.total` IS the number of active tasks across
   * every page, which is what the footer reports. On the other views the
   * server has not sent a per-status breakdown, so the count falls back to
   * the rows on screen; the footer labels it accordingly.
   */
  const totalInView = meta?.total ?? 0
  const activeCount = filter === 'active' ? totalInView : todos.filter((t) => !t.completed).length
  const isActiveCountExact = filter === 'active' || (meta ? meta.totalPages <= 1 : false)

  // "Clear completed" acts on the whole account, so it stays enabled whenever
  // completed tasks could exist — on the Active view that cannot be judged
  // from these rows, so the button is left available rather than wrongly
  // disabled. The API is a no-op when nothing matches.
  const hasCompletedOnPage = todos.some((t) => t.completed)
  const canClearCompleted =
    filter === 'completed' ? totalInView > 0 : filter === 'all' ? hasCompletedOnPage : true

  const handleAdd = async (title: string, todoPriority: TodoPriority) => {
    setAddError(null)
    try {
      await createTodo({ title, priority: todoPriority }).unwrap()
      // A new row may sort onto the first page; go there so it is visible.
      setPage(1)
    } catch (err) {
      setAddError(getErrorMessage(err, 'Could not add the task'))
      throw err
    }
  }

  const handleToggle = async (id: string) => {
    pending.add(id)
    try {
      await toggleTodo({ id, query }).unwrap()
    } catch {
      // The optimistic patch is rolled back inside the endpoint.
    } finally {
      pending.remove(id)
    }
  }

  const handleEdit = async (
    id: string,
    patch: { title?: string; priority?: TodoPriority }
  ) => {
    pending.add(id)
    try {
      await updateTodo({ id, ...patch, query }).unwrap()
    } catch {
      // Rolled back inside the endpoint.
    } finally {
      pending.remove(id)
    }
  }

  // Deleting the last row of a page would otherwise strand the user on an
  // empty page.
  const handleDelete = async (id: string) => {
    try {
      await deleteTodo({ id, query }).unwrap()
      if (todos.length === 1 && page > 1) setPage(page - 1)
    } catch {
      // The optimistic removal is rolled back inside the endpoint.
    }
  }

  const handleSortChange = (nextSortBy: SortType, nextSortOrder: SortOrder) => {
    setSortBy(nextSortBy)
    setSortOrder(nextSortOrder)
  }

  // A bulk clear can remove every row on the current page — and the whole
  // page along with it — so return to the first page.
  const handleClearCompleted = async () => {
    await deleteCompleted()
    setPage(1)
  }

  // Skeletons belong to the very first load only. Later refetches keep the
  // existing rows on screen so the list does not jump.
  const isInitialLoading = isLoading && !data
  const isRefreshing = isFetching && !isInitialLoading

  // Deletions elsewhere can shrink the collection past the current page,
  // which would otherwise leave the user staring at an empty list.
  useEffect(() => {
    if (meta && meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages)
    }
  }, [meta, page])

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">todos</h1>
      </header>

      <main className="app__main">
        <AddTodo onAdd={handleAdd} isSubmitting={isCreating} serverError={addError} />

        <TodoToolbar
          search={search}
          onSearchChange={setSearch}
          priority={priority}
          onPriorityChange={setPriority}
          isSearching={isRefreshing}
        />

        {error && (
          <p className="app__alert" role="alert">
            {getErrorMessage(error, 'Could not load your tasks')}
          </p>
        )}

        <TodoList
          todos={todos}
          isInitialLoading={isInitialLoading}
          isRefreshing={isRefreshing}
          pendingIds={pending.ids}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onToggle={(id) => void handleToggle(id)}
          onDelete={(id) => void handleDelete(id)}
          onEdit={(id, patch) => void handleEdit(id, patch)}
        />

        {/*
          Shown whenever a list has loaded — never gated on this view being
          non-empty, or an empty "Completed" view would hide the very filter
          needed to get back out of it.
        */}
        {meta && (
          <footer className="app__footer">
            <span
              className="app__count"
              title={
                isActiveCountExact
                  ? undefined
                  : 'Count for the tasks currently shown'
              }
            >
              {activeCount} item{activeCount !== 1 ? 's' : ''} left
              {!isActiveCountExact && ' on this page'}
            </span>
            <TodoFilter currentFilter={filter} onFilterChange={setFilter} />
            <button
              className="app__clear-btn"
              onClick={() => void handleClearCompleted()}
              disabled={!canClearCompleted || isClearing}
              type="button"
            >
              {isClearing ? (
                <>
                  <Spinner size="small" /> Clearing…
                </>
              ) : (
                'Clear completed'
              )}
            </button>
          </footer>
        )}

        {meta && <Pagination meta={meta} onPageChange={setPage} />}
      </main>
    </div>
  )
}

export default TodosPage
