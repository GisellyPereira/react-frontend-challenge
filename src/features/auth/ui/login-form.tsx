import { useForm } from '@tanstack/react-form'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { RadialFillButton } from '@/shared/ui/radial-fill-button'

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
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
      className="mt-7 max-w-[25rem] space-y-5"
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
            <div className="space-y-2" data-form-field>
              <Label
                className="text-[0.64rem] font-bold tracking-[0.17em] text-foreground uppercase"
                htmlFor={field.name}
              >
                Email
              </Label>
              <div className="group relative rounded-xl border border-border bg-card/65 transition-[border-color,box-shadow,background-color] focus-within:border-book-coral focus-within:bg-card focus-within:shadow-[0_0_0_4px_rgb(216_88_50_/_0.08)]">
                <Input
                  className="h-12 rounded-xl border-0 bg-transparent px-4 text-sm font-semibold text-ink shadow-none placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0"
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  value={field.state.value}
                  aria-describedby={
                    errorMessages.length > 0 ? errorId : undefined
                  }
                  aria-invalid={errorMessages.length > 0}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </div>
              {errorMessages.length > 0 ? (
                <p
                  className="flex items-center gap-2 text-xs font-semibold text-destructive"
                  id={errorId}
                  role="alert"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-current"
                  />
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
            <div className="space-y-2" data-form-field>
              <Label
                className="text-[0.64rem] font-bold tracking-[0.17em] text-foreground uppercase"
                htmlFor={field.name}
              >
                Senha
              </Label>
              <div className="group relative rounded-xl border border-border bg-card/65 transition-[border-color,box-shadow,background-color] focus-within:border-book-coral focus-within:bg-card focus-within:shadow-[0_0_0_4px_rgb(216_88_50_/_0.08)]">
                <Input
                  className="h-12 rounded-xl border-0 bg-transparent px-4 pr-12 text-sm font-semibold text-ink shadow-none placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0"
                  id={field.name}
                  name={field.name}
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={field.state.value}
                  aria-describedby={
                    errorMessages.length > 0 ? errorId : undefined
                  }
                  aria-invalid={errorMessages.length > 0}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <button
                  className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink/45 transition-colors hover:bg-book-coral/10 hover:text-text-coral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-book-coral"
                  type="button"
                  aria-label={
                    isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'
                  }
                  aria-pressed={isPasswordVisible}
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                >
                  {isPasswordVisible ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
              {errorMessages.length > 0 ? (
                <p
                  className="flex items-center gap-2 text-xs font-semibold text-destructive"
                  id={errorId}
                  role="alert"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-current"
                  />
                  {errorMessages.join(' ')}
                </p>
              ) : null}
            </div>
          )
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <RadialFillButton
            className="mt-2 h-12 w-full rounded-md border-transparent bg-action px-5 text-sm font-bold text-action-foreground shadow-none hover:border-transparent hover:bg-action/90 focus-visible:border-transparent focus-visible:ring-book-coral/35"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </RadialFillButton>
        )}
      </form.Subscribe>
    </form>
  )
}
