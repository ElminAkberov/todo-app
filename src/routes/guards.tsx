import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth/useAuth'
import Spinner from '@/components/ui/Spinner'

function Splash() {
  return (
    <div className="splash">
      <Spinner />
      <p className="splash__text">Loading…</p>
    </div>
  )
}

/** Blocks protected routes until the session probe settles. */
export function RequireAuth() {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) return <Splash />

  if (!isAuthenticated) {
    // Remember where the user was headed, so login can return them there.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

/** Keeps an already-signed-in user out of the login/register pages. */
export function RequireGuest() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) return <Splash />
  if (isAuthenticated) return <Navigate to="/" replace />

  return <Outlet />
}
