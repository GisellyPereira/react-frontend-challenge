import { Moon, Sun } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useThemeStore } from '../model/theme-store'
import './theme-toggle.css'

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const label = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="theme-toggle"
      aria-label={label}
      title={label}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Sun aria-hidden="true" />
      ) : (
        <Moon aria-hidden="true" />
      )}
    </Button>
  )
}
