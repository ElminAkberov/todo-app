import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import AuthForm, { type AuthFormValues } from '@/features/auth/AuthForm'
import { useLoginMutation } from '@/services/api/auth/auth.api'
import { getErrorMessage } from '@/services/baseApi'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [login, { isLoading }] = useLoginMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  // Set by RequireAuth so a deep link survives the login round-trip.
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const handleSubmit = async (values: AuthFormValues) => {
    setServerError(null)
    try {
      await login(values).unwrap()
      void navigate(from, { replace: true })
    } catch (err) {
      setServerError(getErrorMessage(err, 'Email or password are incorrect'))
    }
  }

  return (
    <AuthForm
      title="Sign in to your account"
      submitLabel="Sign in"
      pendingLabel="Signing in…"
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      serverError={serverError}
      footer={{ prompt: 'No account yet?', linkText: 'Create one', to: '/register' }}
    />
  )
}

export default LoginPage
