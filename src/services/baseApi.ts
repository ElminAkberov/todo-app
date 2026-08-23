import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { clearCredentials, setCredentials } from '@/services/slices/auth.slice'
import type { RootState } from '@/services/store'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  // Required so the browser sends/receives the httpOnly `refreshToken` cookie.
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// Mutex to prevent multiple simultaneous refresh attempts when concurrent requests all get 401.
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = (async () => {
        // The refresh token is read from the httpOnly cookie, so no body is sent.
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions
        )

        if (refreshResult.data) {
          const { accessToken } = refreshResult.data as { accessToken: string }
          api.dispatch(setCredentials({ accessToken }))
          return true
        }

        api.dispatch(clearCredentials())
        return false
      })().finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
    }

    const refreshed = await refreshPromise

    if (refreshed) {
      result = await baseQuery(args, api, extraOptions)
    }
  }

  return result
}

/**
 * Trades the httpOnly refresh cookie for an access token, outside of RTK
 * Query. Used by the startup bootstrap so a reload does not have to provoke
 * a 401 on a protected route first. Returns null when there is no session.
 */
export async function refreshSession(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return null
    const body = (await res.json()) as { accessToken?: string }
    return body.accessToken ?? null
  } catch {
    return null
  }
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 300,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  tagTypes: ['Todo', 'User'],
  endpoints: () => ({}),
})

/** Pulls a readable message out of Nest's error shape. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as FetchBaseQueryError).data as
      | { message?: string | string[] }
      | undefined
    const message = data?.message
    if (Array.isArray(message)) return message[0] ?? fallback
    if (typeof message === 'string') return message
  }
  if (typeof error === 'object' && error !== null && 'error' in error) {
    return String((error as { error: string }).error)
  }
  return fallback
}
