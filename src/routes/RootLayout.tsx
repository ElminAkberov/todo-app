import { Outlet } from 'react-router'
import { useAuth, useSessionBootstrap } from '@/features/auth/useAuth'

/**
 * Wraps every route. Runs the one-time session bootstrap and renders the
 * account bar once a user is present.
 */
function RootLayout() {
  useSessionBootstrap()
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div className="shell">
      {isAuthenticated && user && (
        <div className="account-bar">
          <span className="account-bar__email" title={user.email}>
            {user.email}
          </span>
          <button className="account-bar__logout" onClick={() => void logout()} type="button">
            Sign out
          </button>
        </div>
      )}
      <Outlet />
    </div>
  )
}

export default RootLayout
