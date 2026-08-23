import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'

export interface AuthFormValues {
  email: string
  password: string
}

interface AuthFormProps {
  title: string
  submitLabel: string
  pendingLabel: string
  onSubmit: (values: AuthFormValues) => Promise<void>
  isSubmitting: boolean
  serverError: string | null
  footer: { prompt: string; linkText: string; to: string }
  /** Register enforces the API's 6-character minimum and confirms the password. */
  withConfirm?: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 6

function AuthForm({
  title,
  submitLabel,
  pendingLabel,
  onSubmit,
  isSubmitting,
  serverError,
  footer,
  withConfirm = false,
}: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const next: Record<string, string> = {}

    if (!email.trim()) next.email = 'Email is required.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.'

    if (!password) next.password = 'Password is required.'
    else if (withConfirm && password.length < MIN_PASSWORD)
      next.password = `Password must be at least ${MIN_PASSWORD} characters.`

    if (withConfirm && confirm !== password) next.confirm = 'Passwords do not match.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({ email: email.trim(), password })
  }

  return (
    <div className="auth">
      <header className="auth__header">
        <h1 className="auth__brand">todos</h1>
        <p className="auth__subtitle">{title}</p>
      </header>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="auth__alert" role="alert">
            {serverError}
          </div>
        )}

        <div className="auth__field">
          <label className="auth__label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className={`auth__input${errors.email ? ' auth__input--error' : ''}`}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors((prev) => ({ ...prev, email: '' }))
            }}
            placeholder="user@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            autoFocus
          />
          {errors.email && <span className="auth__error">{errors.email}</span>}
        </div>

        <div className="auth__field">
          <label className="auth__label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className={`auth__input${errors.password ? ' auth__input--error' : ''}`}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((prev) => ({ ...prev, password: '' }))
            }}
            placeholder="••••••••"
            autoComplete={withConfirm ? 'new-password' : 'current-password'}
            disabled={isSubmitting}
          />
          {errors.password && <span className="auth__error">{errors.password}</span>}
        </div>

        {withConfirm && (
          <div className="auth__field">
            <label className="auth__label" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              className={`auth__input${errors.confirm ? ' auth__input--error' : ''}`}
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value)
                setErrors((prev) => ({ ...prev, confirm: '' }))
              }}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            {errors.confirm && <span className="auth__error">{errors.confirm}</span>}
          </div>
        )}

        <button className="auth__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? pendingLabel : submitLabel}
        </button>
      </form>

      <p className="auth__footer">
        {footer.prompt}{' '}
        <Link className="auth__link" to={footer.to}>
          {footer.linkText}
        </Link>
      </p>
    </div>
  )
}

export default AuthForm
