import { useCallback, useEffect } from 'react'

import { baseApi, refreshSession } from '@/services/baseApi'
import { useLazyGetProfileQuery, useLogoutMutation } from '@/services/api/auth/auth.api'
import { bootstrapped, clearCredentials, setCredentials } from '@/services/slices/auth.slice'
import { useAppDispatch, useAppSelector } from '@/services/store'

/**
 * Reads auth state from the store and exposes the session actions.
 *
 * Login/register are consumed directly via their generated mutation hooks in
 * the forms, since those need per-form loading and error state.
 */
export function useAuth() {
  const { user, accessToken, isBootstrapping } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const [logoutMutation] = useLogoutMutation()

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap()
    } catch {
      // Clearing the local session matters more than the round-trip.
    }
    dispatch(clearCredentials())
    dispatch(baseApi.util.resetApiState())
  }, [dispatch, logoutMutation])

  return {
    user,
    isAuthenticated: Boolean(user && accessToken),
    isBootstrapping,
    logout,
  }
}

/**
 * Runs once at app start. After a reload there is no access token in memory,
 * only the httpOnly refresh cookie.
 *
 * The refresh is done explicitly BEFORE asking for the profile. Calling
 * /auth/me first would also work — baseQueryWithReauth would recover from the
 * 401 — but it makes every page load log a failed request in the console, so
 * the token is obtained up front instead.
 */
export function useSessionBootstrap() {
  const dispatch = useAppDispatch()
  const [fetchProfile] = useLazyGetProfileQuery()
  const isBootstrapping = useAppSelector((s) => s.auth.isBootstrapping)

  useEffect(() => {
    if (!isBootstrapping) return
    let cancelled = false

    void (async () => {
      try {
        const token = await refreshSession()
        // No valid cookie — stay logged out without calling a protected route.
        if (token && !cancelled) {
          dispatch(setCredentials({ accessToken: token }))
          await fetchProfile().unwrap()
        }
      } catch {
        // Nothing to restore.
      }
      if (!cancelled) dispatch(bootstrapped())
    })()

    return () => {
      cancelled = true
    }
  }, [dispatch, fetchProfile, isBootstrapping])
}
