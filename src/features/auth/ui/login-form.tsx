import { useForm } from '@tanstack/react-form'

import {
  loginSchema,
  type LoginCredentials,
  type ValidLoginCredentials,
} from '../model/login-schema'

interface LoginFormProps {
  onSubmit: (credentials: ValidLoginCredentials) => Promise<void> | void
}

const defaultValues: LoginCredentials = {
  email: '',
  password: '',
}

function getValidationMessage(error: unknown) {
  if (typeof error === 'string') {
    return error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return 'Valor inválido.'
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      const credentials = loginSchema.parse(value)
      await onSubmit(credentials)
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="email">
        {(field) => {
          const errorMessages =
            field.state.meta.errors.map(getValidationMessage)
          const errorId = `${field.name}-error`

          return (
            <div>
              <label htmlFor={field.name}>Email</label>
              <input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                value={field.state.value}
                aria-describedby={
                  errorMessages.length > 0 ? errorId : undefined
                }
                aria-invalid={errorMessages.length > 0}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {errorMessages.length > 0 ? (
                <p id={errorId} role="alert">
                  {errorMessages.join(' ')}
                </p>
              ) : null}
            </div>
          )
        }}
      </form.Field>

      <form.Field name="password">
        {(field) => {
          const errorMessages =
            field.state.meta.errors.map(getValidationMessage)
          const errorId = `${field.name}-error`

          return (
            <div>
              <label htmlFor={field.name}>Senha</label>
              <input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                aria-describedby={
                  errorMessages.length > 0 ? errorId : undefined
                }
                aria-invalid={errorMessages.length > 0}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {errorMessages.length > 0 ? (
                <p id={errorId} role="alert">
                  {errorMessages.join(' ')}
                </p>
              ) : null}
            </div>
          )
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
