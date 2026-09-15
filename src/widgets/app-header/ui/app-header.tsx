import { Link } from '@tanstack/react-router'
import { Popover } from 'radix-ui'
import { Compass, Library } from 'lucide-react'
import { Button } from '@/shared/ui/button'

import { LogoutButton, selectAuthSession, useAuthStore } from '@/features/auth'
import { LibrisLogo } from '@/shared/ui/libris-logo'
import { ThemeToggle } from '@/features/theme'

import './app-header.css'

const navigationItems = [
  { label: 'Descobrir', to: '/discover', icon: Compass },
  { label: 'Minha estante', to: '/shelf', icon: Library },
] as const

export function AppHeader() {
  const session = useAuthStore(selectAuthSession)

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link
          className="app-header__brand"
          to="/discover"
          aria-label="Ir para Descobrir"
        >
          <LibrisLogo className="app-header__logo" size="compact" />
        </Link>

        <nav
          className="app-header__navigation"
          aria-label="Navegação principal"
        >
          {navigationItems.map((item) => (
            <Link
              activeOptions={{ exact: true, includeSearch: false }}
              className="app-header__navigation-link"
              key={item.to}
              to={item.to}
            >
              <item.icon
                className="app-header__navigation-icon"
                size={18}
                aria-hidden="true"
              />
              <span className="app-header__navigation-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="app-header__account-area">
          <ThemeToggle />
          {session && (
            <Popover.Root>
              <Popover.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="app-header__mobile-account"
                  aria-label="Abrir opções da conta"
                >
                  <span
                    className="app-header__account-avatar"
                    aria-hidden="true"
                  >
                    {session.email.charAt(0)}
                  </span>
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="app-header__account-popover"
                  align="end"
                  sideOffset={10}
                  collisionPadding={16}
                  aria-label="Sua conta"
                >
                  <p className="app-header__account-caption">
                    Seu cantinho no Libris
                  </p>
                  <p className="app-header__account-address">{session.email}</p>
                  <LogoutButton />
                  <Popover.Arrow className="app-header__account-arrow" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}
          {session ? (
            <div
              className="app-header__account"
              aria-label={`Conta conectada: ${session.email}`}
            >
              <span aria-hidden="true" className="app-header__account-avatar">
                {session.email.charAt(0)}
              </span>
              <span className="app-header__account-email" title={session.email}>
                {session.email}
              </span>
            </div>
          ) : null}
          <div className="app-header__desktop-logout">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
