import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import {
  createAuthSession,
  LoginForm,
  useAuthStore,
  type ValidLoginCredentials,
} from '@/features/auth'
import { gsap, useGSAP } from '@/shared/lib/gsap'
import { LibrisLogo } from '@/shared/ui/libris-logo'
import { BookshelfScene } from '@/widgets/bookshelf-scene'

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
        gsap
          .timeline({ defaults: { duration: 0.65, ease: 'power3.out' } })
          .from('[data-login-reveal]', { autoAlpha: 0, y: 24, stagger: 0.09 })
          .from(
            '[data-login-logo]',
            { scale: 0.92, rotation: -2, transformOrigin: 'bottom left' },
            0.08,
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
      className="min-h-svh overflow-x-hidden bg-background text-foreground"
    >
      <div className="grid min-h-svh grid-cols-1 md:grid-cols-[minmax(22rem,44%)_minmax(0,1fr)] xl:grid-cols-[42%_58%]">
        <section
          className="flex min-h-svh min-w-0 flex-col px-6 py-6 sm:px-12 sm:py-8 md:px-[clamp(2rem,4vw,4.5rem)] md:py-6 xl:px-[clamp(3rem,5vw,7rem)]"
          aria-labelledby="login-title"
        >
          <div className="flex flex-1 flex-col justify-center py-10 sm:py-14 lg:py-0">
            <div className="mx-auto w-full max-w-[27rem] md:mx-0">
              <div data-login-reveal>
                <LibrisLogo size="display" />
              </div>

              <div className="mt-8 sm:mt-10" data-login-reveal>
                <p className="text-[0.62rem] font-extrabold tracking-[0.2em] text-book-coral uppercase">
                  De volta à sua estante
                </p>
                <h1
                  className="mt-3 max-w-[17ch] font-display text-[clamp(1.75rem,2.8vw,2.75rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-foreground"
                  id="login-title"
                >
                  Acesse o Libris
                </h1>
                <p className="mt-3 max-w-[38ch] text-sm leading-6 text-muted-foreground">
                  Encontre novas leituras e organize os livros que fazem parte
                  da sua história.
                </p>

                <LoginForm onSubmit={handleLogin} />

                <p className="mt-4 flex max-w-[25rem] items-start gap-3 text-xs leading-5 text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-book-gold"
                  />
                  <span>
                    Para explorar, use qualquer email válido e uma senha com
                    pelo menos 7 caracteres.
                  </span>
                </p>
              </div>
            </div>
          </div>

          <footer
            className="mx-auto flex w-full max-w-[27rem] items-center justify-end text-[0.55rem] font-bold tracking-[0.13em] text-muted-foreground uppercase md:mx-0"
            data-login-reveal
          >
            <span>© {new Date().getFullYear()} Libris</span>
          </footer>
        </section>

        <BookshelfScene />
      </div>
    </main>
  )
}
