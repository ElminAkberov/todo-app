import { useState } from 'react'
import { useNavigate } from 'react-router'
import AuthForm, { type AuthFormValues } from '@/features/auth/AuthForm'
import { useLoginMutation, useRegisterMutation } from '@/services/api/auth/auth.api'
import { getErrorMessage } from '@/services/baseApi'

function RegisterPage() {
  const navigate = useNavigate()
  const [register, { isLoading: isRegistering }] = useRegisterMutation()
  const [login, { isLoading: isLoggingIn }] = useLoginMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (values: AuthFormValues) => {
    setServerError(null)
    try {
      await register(values).unwrap()
      // Registration returns no token, so sign the user straight in.
      await login(values).unwrap()
      void navigate('/', { replace: true })
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not create the account'))
    }
  }

  return (
    <AuthForm
      title="Create your account"
      submitLabel="Create account"
      pendingLabel="Creating…"
      onSubmit={handleSubmit}
      isSubmitting={isRegistering || isLoggingIn}
      serverError={serverError}
      footer={{ prompt: 'Already registered?', linkText: 'Sign in', to: '/login' }}
      withConfirm
    />
  )
}

export default RegisterPage
