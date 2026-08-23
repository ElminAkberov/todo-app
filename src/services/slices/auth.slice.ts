import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/services/api/auth/auth.types'

interface AuthState {
  /** Kept in memory only — never persisted. Restored from the refresh cookie on load. */
  accessToken: string | null
  user: User | null
  /** True until the initial cookie-based session probe settles. */
  isBootstrapping: boolean
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isBootstrapping: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ accessToken: string; user?: User }>) {
      state.accessToken = action.payload.accessToken
      if (action.payload.user) state.user = action.payload.user
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload
    },
    bootstrapped(state) {
      state.isBootstrapping = false
    },
    clearCredentials(state) {
      state.accessToken = null
      state.user = null
    },
  },
})

export const { setCredentials, setUser, bootstrapped, clearCredentials } = authSlice.actions
export default authSlice.reducer
