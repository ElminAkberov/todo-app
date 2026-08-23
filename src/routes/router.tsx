import { createBrowserRouter } from 'react-router'
import RootLayout from '@/routes/RootLayout'
import TodosPage from '@/routes/TodosPage'
import LoginPage from '@/routes/LoginPage'
import RegisterPage from '@/routes/RegisterPage'
import NotFoundPage from '@/routes/NotFoundPage'
import { RequireAuth, RequireGuest } from '@/routes/guards'

/**
 * Data-mode router. Data loading lives in RTK Query rather than in route
 * loaders, so the guards stay component-level (they depend on store state
 * that settles asynchronously at startup).
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <RequireGuest />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [{ path: '/', element: <TodosPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
