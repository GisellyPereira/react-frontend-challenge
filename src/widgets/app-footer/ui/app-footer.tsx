import { LibrisLogo } from '@/shared/ui/libris-logo'

import './app-footer.css'

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__brand">
          <LibrisLogo />
          <p>Um livro, tantas possibilidades.</p>
        </div>
        <p className="app-footer__credits">
          © {new Date().getFullYear()} Libris
        </p>
      </div>
    </footer>
  )
}
