import { useNavigate } from '@tanstack/react-router'
import { BookOpenText, Sparkles } from 'lucide-react'
import { useRef } from 'react'

import {
  createAuthSession,
  LoginForm,
  useAuthStore,
  type ValidLoginCredentials,
} from '@/features/auth'
import { gsap, useGSAP } from '@/shared/lib/gsap'
import { LibrisLogo } from '@/shared/ui/libris-logo'
import { LibraryPortal } from '@/widgets/library-portal'

export function LoginPage() {
  const pageRef = useRef<HTMLElement>(null)
  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()

  useGSAP(
    () => {
      if (typeof window.matchMedia !== 'function') {
        return
      }

      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

        timeline
          .from('[data-login-logo]', {
            autoAlpha: 0,
            y: -16,
            duration: 0.55,
          })
          .from(
            '[data-login-reveal]',
            {
              autoAlpha: 0,
              y: 24,
              duration: 0.65,
              stagger: 0.08,
            },
            0.12,
          )
          .from(
            '[data-login-card]',
            {
              autoAlpha: 0,
              y: 28,
              scale: 0.98,
              duration: 0.75,
            },
            0.26,
          )
      })

      return () => media.revert()
    },
    { scope: pageRef },
  )

  async function handleLogin(credentials: ValidLoginCredentials) {
    const session = createAuthSession(credentials)

    setSession(session)
    await navigate({ to: '/discover', replace: true })
  }

  return (
    <main
      ref={pageRef}
      className="relative min-h-svh overflow-hidden bg-background p-3 text-foreground sm:p-5 lg:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--ink-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--ink-grid)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-[size:3.5rem_3.5rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-book-gold/14 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[42%] -bottom-44 size-96 rounded-full bg-book-coral/10 blur-3xl"
      />

      <div className="relative mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-[94rem] grid-cols-1 gap-4 lg:min-h-[calc(100svh-3rem)] lg:grid-cols-[minmax(25rem,0.86fr)_minmax(36rem,1.14fr)]">
        <section
          className="flex min-w-0 flex-col px-3 py-3 sm:px-7 sm:py-4 lg:px-[clamp(1rem,4vw,5rem)]"
          aria-labelledby="login-title"
        >
          <header className="flex items-center justify-between" data-login-logo>
            <LibrisLogo />
            <span className="hidden items-center gap-2 text-[0.65rem] font-bold tracking-[0.14em] text-ink/52 uppercase sm:flex">
              <span className="size-1.5 rounded-full bg-book-coral" />
              Biblioteca pessoal
            </span>
          </header>

          <div className="mx-auto flex w-full max-w-[31rem] flex-1 flex-col justify-center py-10 lg:py-5">
            <div data-login-reveal>
              <p className="mb-3 flex items-center gap-2 text-[0.68rem] font-bold tracking-[0.17em] text-primary uppercase">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Seu universo literário
              </p>
              <h1
                className="max-w-[10ch] font-display text-[clamp(3.1rem,5.5vw,4.75rem)] leading-[0.83] font-semibold tracking-[-0.065em] text-ink"
                id="login-title"
              >
                Acesse o <em className="font-medium text-book-coral">Libris</em>
              </h1>
              <p className="mt-4 max-w-[39ch] text-[0.9rem] leading-6 text-muted-foreground sm:text-[0.94rem]">
                Descubra novos mundos e mantenha cada leitura no lugar certo da
                sua estante.
              </p>
            </div>

            <div
              className="relative mt-5 rounded-[2rem] border border-ink/10 bg-paper/72 p-5 shadow-[0_1.5rem_5rem_rgba(28,55,46,0.09)] backdrop-blur-xl"
              data-login-card
            >
              <span
                aria-hidden="true"
                className="absolute -top-3 right-7 rotate-2 rounded-full border border-ink/10 bg-book-gold px-3 py-1 text-[0.58rem] font-extrabold tracking-[0.1em] text-ink uppercase shadow-sm"
              >
                Acesso do leitor
              </span>
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="font-display text-2xl font-semibold tracking-[-0.035em] text-ink">
                    Bem-vinda de volta.
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    Sua estante continua exatamente onde você deixou.
                  </p>
                </div>
                <span className="flex size-10 shrink-0 rotate-3 items-center justify-center rounded-2xl bg-book-rose/16 text-book-rose">
                  <BookOpenText aria-hidden="true" className="size-5" />
                </span>
              </div>

              <LoginForm onSubmit={handleLogin} />

              <div className="mt-5 flex items-start gap-3 border-t border-dashed border-ink/15 pt-4 text-[0.66rem] leading-[1.15rem] text-ink/58">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-book-jade" />
                <p>
                  Para explorar, use qualquer email válido e uma senha com 7 ou
                  mais caracteres.
                </p>
              </div>
            </div>
          </div>

          <footer
            className="hidden items-center justify-between text-[0.62rem] font-semibold tracking-[0.08em] text-ink/42 uppercase sm:flex"
            data-login-reveal
          >
            <span>Organize suas leituras</span>
            <span>© {new Date().getFullYear()} Libris</span>
          </footer>
        </section>

        <LibraryPortal />
      </div>
    </main>
  )
}
