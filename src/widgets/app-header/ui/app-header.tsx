import { Link } from '@tanstack/react-router'

import { LogoutButton, selectAuthSession, useAuthStore } from '@/features/auth'
import { LibrisLogo } from '@/shared/ui/libris-logo'

import './app-header.css'

const navigationItems = [
  { label: 'Descobrir', to: '/discover' },
  { label: 'Minha estante', to: '/shelf' },
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
              <span className="app-header__navigation-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="app-header__account-area">
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
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
