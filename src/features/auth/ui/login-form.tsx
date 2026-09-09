import { useForm } from '@tanstack/react-form'
import { ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

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
      className="mt-5 space-y-4"
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
            <div className="space-y-2.5" data-form-field>
              <Label
                className="font-sans text-[0.72rem] font-bold tracking-[0.12em] text-ink uppercase"
                htmlFor={field.name}
              >
                Email
              </Label>
              <div className="group relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-4 size-[1.05rem] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                  strokeWidth={1.8}
                />
                <Input
                  className="h-11 rounded-2xl border-ink/15 bg-white/55 pr-4 pl-11 text-[0.9rem] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] placeholder:text-ink/38 hover:border-ink/30 focus-visible:border-primary focus-visible:ring-primary/15"
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
            <div className="space-y-2.5" data-form-field>
              <Label
                className="font-sans text-[0.72rem] font-bold tracking-[0.12em] text-ink uppercase"
                htmlFor={field.name}
              >
                Senha
              </Label>
              <div className="group relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-4 size-[1.05rem] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                  strokeWidth={1.8}
                />
                <Input
                  className="h-11 rounded-2xl border-ink/15 bg-white/55 pr-12 pl-11 text-[0.9rem] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] placeholder:text-ink/38 hover:border-ink/30 focus-visible:border-primary focus-visible:ring-primary/15"
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
                  className="absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-xl text-ink/48 transition-colors hover:bg-ink/6 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
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
          <Button
            className="group mt-1 h-11 w-full rounded-2xl bg-ink px-5 text-[0.78rem] font-bold tracking-[0.08em] text-paper uppercase shadow-[0_7px_0_var(--book-gold)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-ink-soft hover:shadow-[0_9px_0_var(--book-gold)] active:translate-y-1 active:shadow-[0_3px_0_var(--book-gold)]"
            type="submit"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'Entrando…' : 'Entrar'}</span>
            <span className="ml-auto flex size-7 items-center justify-center rounded-full bg-paper text-ink transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </span>
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
