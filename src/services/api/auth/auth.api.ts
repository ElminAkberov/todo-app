import { baseApi } from '@/services/baseApi'
import { setCredentials, setUser } from '@/services/slices/auth.slice'
import type { Credentials, LoginResponse, User } from './auth.types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<User, Credentials>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (res: { message: string; data: User }) => res.data,
    }),

    login: builder.mutation<LoginResponse, Credentials>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (res: { message: string; data: LoginResponse }) => res.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(setCredentials(data))
      },
      invalidatesTags: ['Todo', 'User'],
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      // Deliberately no invalidatesTags: invalidating would refetch /todos
      // while signed out. useAuth() calls resetApiState() instead, which
      // drops the whole cache outright.
    }),

    getProfile: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (res: { data: User }) => res.data,
      providesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setUser(data))
        } catch {
          // 401 is handled by baseQueryWithReauth, which clears the session.
        }
      },
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
} = authApi
